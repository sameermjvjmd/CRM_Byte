using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;
using CRM.Api.DTOs;
using CRM.Api.DTOs.Search;
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

            // Parse the dynamic query (JSON format) - Standardized to SavedSearchCriteriaContainer
            try
            {
                var container = JsonSerializer.Deserialize<SavedSearchCriteriaContainer>(group.DynamicQuery);
                if (container == null || container.Criteria == null) return BadRequest("Invalid query definition.");

                var query = _context.Contacts.Include(c => c.Company).AsQueryable();

                if (container.MatchType == "Any")
                {
                    var combinedResults = new List<Contact>();
                    foreach (var criteria in container.Criteria)
                    {
                        var fieldQuery = _context.Contacts.Include(c => c.Company).AsQueryable();
                        fieldQuery = ApplyCriteria(fieldQuery, criteria);
                        combinedResults.AddRange(await fieldQuery.ToListAsync());
                    }
                    return Ok(combinedResults.DistinctBy(c => c.Id).OrderBy(c => c.LastName).ThenBy(c => c.FirstName).ToList());
                }
                else
                {
                    foreach (var criteria in container.Criteria)
                    {
                        query = ApplyCriteria(query, criteria);
                    }
                    return Ok(await query.OrderBy(c => c.LastName).ThenBy(c => c.FirstName).ToListAsync());
                }
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

        // Helper method to apply dynamic query criteria (Copied from ContactsController)
        private IQueryable<Contact> ApplyCriteria(IQueryable<Contact> query, SearchCriteriaDto criteria)
        {
            var field = criteria.Field.ToLower();
            var op = criteria.Operator;
            var val = criteria.Value.ToLower();

            if (string.IsNullOrEmpty(val)) return query;

            if (field == "company")
            {
                if (op == "Contains") return query.Where(c => c.Company != null && c.Company.Name.ToLower().Contains(val));
                else if (op == "Equals") return query.Where(c => c.Company != null && c.Company.Name.ToLower() == val);
            }
            else if (field == "firstname" || field == "first name" || field == "contact")
            {
                if (op == "Contains") return query.Where(c => c.FirstName.ToLower().Contains(val) || c.LastName.ToLower().Contains(val));
                else if (op == "Equals") return query.Where(c => c.FirstName.ToLower() == val || c.LastName.ToLower() == val);
                else if (op == "Starts With") return query.Where(c => c.FirstName.ToLower().StartsWith(val));
            }
            else if (field == "lastname" || field == "last name")
            {
                if (op == "Contains") return query.Where(c => c.LastName.ToLower().Contains(val));
                else if (op == "Equals") return query.Where(c => c.LastName.ToLower() == val);
            }
            else if (field == "email")
            {
                if (op == "Contains") return query.Where(c => c.Email != null && c.Email.ToLower().Contains(val));
            }
            else if (field == "jobtitle" || field == "job title")
            {
                if (op == "Contains") return query.Where(c => c.JobTitle != null && c.JobTitle.ToLower().Contains(val));
            }
            else if (field == "city")
            {
                if (op == "Contains") return query.Where(c => c.City != null && c.City.ToLower().Contains(val));
            }
             else if (field == "state")
            {
                if (op == "Contains") return query.Where(c => c.State != null && c.State.ToLower().Contains(val));
            }
            return query;
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


}
