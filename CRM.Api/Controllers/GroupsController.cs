using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;
using System.Text.Json;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GroupsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public GroupsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/groups
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Group>>> GetGroups([FromQuery] string? search)
        {
            var query = _context.Groups
                .Include(g => g.Contacts)
                .Include(g => g.ParentGroup)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.ToLower();
                query = query.Where(g => 
                    g.Name.ToLower().Contains(term) ||
                    (g.Description != null && g.Description.ToLower().Contains(term)) ||
                    (g.Category != null && g.Category.ToLower().Contains(term))
                );
            }

            return await query.OrderBy(g => g.Name).ToListAsync();
        }

        // GET: api/groups/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Group>> GetGroup(int id)
        {
            var group = await _context.Groups
                .Include(g => g.Contacts)
                .Include(g => g.ParentGroup)
                .Include(g => g.SubGroups)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (group == null) return NotFound();
            return group;
        }

        // GET: api/groups/5/members
        [HttpGet("{id}/members")]
        public async Task<ActionResult<IEnumerable<Contact>>> GetGroupMembers(int id, [FromQuery] string? search)
        {
            var group = await _context.Groups
                .Include(g => g.Contacts)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (group == null) return NotFound();

            var members = group.Contacts.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.ToLower();
                members = members.Where(c =>
                    c.FirstName.ToLower().Contains(term) ||
                    c.LastName.ToLower().Contains(term) ||
                    c.Email.ToLower().Contains(term)
                );
            }

            return Ok(members.OrderBy(c => c.LastName).ThenBy(c => c.FirstName).ToList());
        }

        // GET: api/groups/5/dynamic-members - For dynamic groups, evaluates query
        [HttpGet("{id}/dynamic-members")]
        public async Task<ActionResult<IEnumerable<Contact>>> GetDynamicGroupMembers(int id)
        {
            var group = await _context.Groups.FindAsync(id);
            if (group == null) return NotFound();

            if (!group.IsDynamic || string.IsNullOrWhiteSpace(group.DynamicQuery))
            {
                return BadRequest("This is not a dynamic group or has no query defined.");
            }

            // Parse the dynamic query (JSON format)
            try
            {
                var queryDef = JsonSerializer.Deserialize<DynamicQueryDefinition>(group.DynamicQuery);
                if (queryDef == null) return BadRequest("Invalid query definition.");

                var contactsQuery = _context.Contacts.Include(c => c.Company).AsQueryable();

                // Apply filters
                foreach (var filter in queryDef.Filters)
                {
                    contactsQuery = ApplyFilter(contactsQuery, filter);
                }

                var results = await contactsQuery.OrderBy(c => c.LastName).ToListAsync();
                return Ok(results);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error executing dynamic query: {ex.Message}");
            }
        }

        // POST: api/groups
        [HttpPost]
        public async Task<ActionResult<Group>> CreateGroup(Group group)
        {
            group.CreatedAt = DateTime.UtcNow;
            group.UpdatedAt = DateTime.UtcNow;
            _context.Groups.Add(group);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetGroup), new { id = group.Id }, group);
        }

        // PUT: api/groups/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGroup(int id, Group group)
        {
            if (id != group.Id) return BadRequest();

            // Prevent circular hierarchy
            if (group.ParentGroupId == group.Id)
            {
                return BadRequest("A group cannot be its own parent.");
            }

            group.UpdatedAt = DateTime.UtcNow;
            _context.Entry(group).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GroupExists(id)) return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/groups/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGroup(int id)
        {
            var group = await _context.Groups
                .Include(g => g.SubGroups)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (group == null) return NotFound();

            // Check for subgroups
            if (group.SubGroups.Any())
            {
                return BadRequest("Cannot delete group with subgroups. Delete or reassign subgroups first.");
            }

            _context.Groups.Remove(group);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: api/groups/5/members - Add single member
        [HttpPost("{id}/members")]
        public async Task<IActionResult> AddMemberToGroup(int id, [FromBody] AddMemberRequest request)
        {
            var group = await _context.Groups
                .Include(g => g.Contacts)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (group == null) return NotFound("Group not found");

            var contact = await _context.Contacts.FindAsync(request.ContactId);
            if (contact == null) return NotFound("Contact not found");

            if (!group.Contacts.Any(c => c.Id == request.ContactId))
            {
                group.Contacts.Add(contact);
                group.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return Ok();
        }

        // POST: api/groups/5/members/bulk - Add multiple members
        [HttpPost("{id}/members/bulk")]
        public async Task<ActionResult<BulkAddResult>> AddMembersBulk(int id, [FromBody] BulkAddMembersRequest request)
        {
            var group = await _context.Groups
                .Include(g => g.Contacts)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (group == null) return NotFound("Group not found");

            var existingIds = group.Contacts.Select(c => c.Id).ToHashSet();
            var contactsToAdd = await _context.Contacts
                .Where(c => request.ContactIds.Contains(c.Id) && !existingIds.Contains(c.Id))
                .ToListAsync();

            foreach (var contact in contactsToAdd)
            {
                group.Contacts.Add(contact);
            }

            group.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new BulkAddResult
            {
                AddedCount = contactsToAdd.Count,
                SkippedCount = request.ContactIds.Count - contactsToAdd.Count,
                TotalMembers = group.Contacts.Count
            });
        }

        // DELETE: api/groups/5/members/5
        [HttpDelete("{id}/members/{contactId}")]
        public async Task<IActionResult> RemoveMemberFromGroup(int id, int contactId)
        {
            var group = await _context.Groups
                .Include(g => g.Contacts)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (group == null) return NotFound("Group not found");

            var contact = group.Contacts.FirstOrDefault(c => c.Id == contactId);
            if (contact != null)
            {
                group.Contacts.Remove(contact);
                group.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }

        // DELETE: api/groups/5/members/bulk - Remove multiple members
        [HttpDelete("{id}/members/bulk")]
        public async Task<ActionResult<BulkRemoveResult>> RemoveMembersBulk(int id, [FromBody] BulkRemoveMembersRequest request)
        {
            var group = await _context.Groups
                .Include(g => g.Contacts)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (group == null) return NotFound("Group not found");

            var contactsToRemove = group.Contacts.Where(c => request.ContactIds.Contains(c.Id)).ToList();

            foreach (var contact in contactsToRemove)
            {
                group.Contacts.Remove(contact);
            }

            group.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new BulkRemoveResult
            {
                RemovedCount = contactsToRemove.Count,
                TotalMembers = group.Contacts.Count
            });
        }

        // GET: api/groups/contact/5 - Get groups for a contact
        [HttpGet("contact/{contactId}")]
        public async Task<ActionResult<IEnumerable<Group>>> GetContactGroups(int contactId)
        {
            var contact = await _context.Contacts
                .Include(c => c.Groups)
                .FirstOrDefaultAsync(c => c.Id == contactId);

            if (contact == null) return NotFound("Contact not found");

            return Ok(contact.Groups);
        }

        // GET: api/groups/5/subgroups
        [HttpGet("{id}/subgroups")]
        public async Task<ActionResult<IEnumerable<Group>>> GetSubGroups(int id)
        {
            var group = await _context.Groups.FindAsync(id);
            if (group == null) return NotFound();

            var subgroups = await _context.Groups
                .Include(g => g.Contacts)
                .Where(g => g.ParentGroupId == id)
                .OrderBy(g => g.Name)
                .ToListAsync();

            return Ok(subgroups);
        }

        // Helper method to apply dynamic query filters
        private IQueryable<Contact> ApplyFilter(IQueryable<Contact> query, QueryFilter filter)
        {
            switch (filter.Field.ToLower())
            {
                case "city":
                    return filter.Operator switch
                    {
                        "equals" => query.Where(c => c.City == filter.Value),
                        "contains" => query.Where(c => c.City != null && c.City.Contains(filter.Value)),
                        _ => query
                    };
                case "state":
                    return filter.Operator switch
                    {
                        "equals" => query.Where(c => c.State == filter.Value),
                        "contains" => query.Where(c => c.State != null && c.State.Contains(filter.Value)),
                        _ => query
                    };
                case "company":
                    return filter.Operator switch
                    {
                        "equals" => query.Where(c => c.Company != null && c.Company.Name == filter.Value),
                        "contains" => query.Where(c => c.Company != null && c.Company.Name.Contains(filter.Value)),
                        _ => query
                    };
                case "jobtitle":
                    return filter.Operator switch
                    {
                        "equals" => query.Where(c => c.JobTitle == filter.Value),
                        "contains" => query.Where(c => c.JobTitle != null && c.JobTitle.Contains(filter.Value)),
                        _ => query
                    };
                case "leadsource":
                    return filter.Operator switch
                    {
                        "equals" => query.Where(c => c.LeadSource == filter.Value),
                        _ => query
                    };
                case "status":
                    return filter.Operator switch
                    {
                        "equals" => query.Where(c => c.Status == filter.Value),
                        _ => query
                    };
                default:
                    return query;
            }
        }

        private bool GroupExists(int id) => _context.Groups.Any(e => e.Id == id);
    }

    // DTOs
    public class AddMemberRequest
    {
        public int ContactId { get; set; }
    }

    public class BulkAddMembersRequest
    {
        public List<int> ContactIds { get; set; } = new();
    }

    public class BulkRemoveMembersRequest
    {
        public List<int> ContactIds { get; set; } = new();
    }

    public class BulkAddResult
    {
        public int AddedCount { get; set; }
        public int SkippedCount { get; set; }
        public int TotalMembers { get; set; }
    }

    public class BulkRemoveResult
    {
        public int RemovedCount { get; set; }
        public int TotalMembers { get; set; }
    }

    public class DynamicQueryDefinition
    {
        public List<QueryFilter> Filters { get; set; } = new();
    }

    public class QueryFilter
    {
        public string Field { get; set; } = string.Empty;
        public string Operator { get; set; } = "equals";
        public string Value { get; set; } = string.Empty;
    }
}
