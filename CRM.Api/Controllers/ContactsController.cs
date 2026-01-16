using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;
using CRM.Api.DTOs;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ContactsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/contacts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Contact>>> GetContacts([FromQuery] string? search)
        {
            var query = _context.Contacts
                .Include(c => c.Company)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.ToLower();
                query = query.Where(c => 
                    c.FirstName.ToLower().Contains(term) || 
                    c.LastName.ToLower().Contains(term) || 
                    c.Email.ToLower().Contains(term) || 
                    c.Phone.Contains(term) ||
                    (c.Company != null && c.Company.Name.ToLower().Contains(term))
                );
            }

            return await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
        }

        // GET: api/contacts/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Contact>> GetContact(int id)
        {
            var contact = await _context.Contacts
                .Include(c => c.Groups)
                .Include(c => c.Company)
                .Include(c => c.ContactEmails.OrderBy(e => e.SortOrder))
                .Include(c => c.ContactAddresses.OrderBy(a => a.SortOrder))
                .FirstOrDefaultAsync(c => c.Id == id);

            if (contact == null)
            {
                return NotFound();
            }

            return contact;
        }

        // POST: api/contacts
        [HttpPost]
        public async Task<ActionResult<Contact>> PostContact(Contact contact)
        {
            contact.CreatedAt = DateTime.UtcNow;
            contact.LastModifiedAt = DateTime.UtcNow;
            _context.Contacts.Add(contact);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetContact), new { id = contact.Id }, contact);
        }

        // PUT: api/contacts/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutContact(int id, Contact contact)
        {
            if (id != contact.Id)
            {
                return BadRequest();
            }

            contact.LastModifiedAt = DateTime.UtcNow;
            _context.Entry(contact).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ContactExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/contacts/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContact(int id)
        {
            var contact = await _context.Contacts.FindAsync(id);
            if (contact == null)
            {
                return NotFound();
            }

            _context.Contacts.Remove(contact);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/contacts/search
        [HttpPost("search")]
        public async Task<ActionResult<IEnumerable<Contact>>> SearchContacts(AdvancedSearchRequestDto request)
        {
            var query = _context.Contacts.AsQueryable();

            if (request.Criteria == null || !request.Criteria.Any())
            {
                return await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
            }

            // For OR logic, we need to collect results and union them
            // For AND logic, we chain the where clauses
            if (request.MatchType == "Any")
            {
                var combinedResults = new List<Contact>();
                foreach (var criteria in request.Criteria)
                {
                    var fieldQuery = _context.Contacts.AsQueryable();
                    fieldQuery = ApplyCriteria(fieldQuery, criteria);
                    combinedResults.AddRange(await fieldQuery.ToListAsync());
                }
                return combinedResults.DistinctBy(c => c.Id).OrderByDescending(c => c.CreatedAt).ToList();
            }
            else // Default to "All" (AND)
            {
                foreach (var criteria in request.Criteria)
                {
                    query = ApplyCriteria(query, criteria);
                }
                return await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
            }
        }

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
                if (op == "Contains") return query.Where(c => c.Email.ToLower().Contains(val));
            }
            else if (field == "jobtitle" || field == "job title")
            {
                if (op == "Contains") return query.Where(c => c.JobTitle != null && c.JobTitle.ToLower().Contains(val));
            }
            else if (field == "city")
            {
                if (op == "Contains") return query.Where(c => c.City != null && c.City.ToLower().Contains(val));
            }
            return query;
        }

        private bool ContactExists(int id)
        {
            return _context.Contacts.Any(e => e.Id == id);
        }
    }
}
