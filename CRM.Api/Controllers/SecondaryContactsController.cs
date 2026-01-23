using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SecondaryContactsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SecondaryContactsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/SecondaryContacts/Contact/5
        [HttpGet("Contact/{contactId}")]
        public async Task<ActionResult<IEnumerable<SecondaryContact>>> GetByContact(int contactId)
        {
            return await _context.SecondaryContacts
                .Where(s => s.PrimaryContactId == contactId)
                .OrderBy(s => s.FirstName)
                .ToListAsync();
        }

        // GET: api/SecondaryContacts/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SecondaryContact>> GetSecondaryContact(int id)
        {
            var secondaryContact = await _context.SecondaryContacts.FindAsync(id);

            if (secondaryContact == null)
            {
                return NotFound();
            }

            return secondaryContact;
        }

        // POST: api/SecondaryContacts
        [HttpPost]
        public async Task<ActionResult<SecondaryContact>> PostSecondaryContact(SecondaryContact secondaryContact)
        {
            // Ensure tenant ID is set (assuming single tenant for now or passed from context, 
            // but effectively we might need to look it up from the primary contact if not provided/validated)
            // For now, accepting what's passed, but verifying PrimaryContact exists
            
            var primaryContact = await _context.Contacts.FindAsync(secondaryContact.PrimaryContactId);
            if (primaryContact == null)
            {
                return BadRequest("Primary contact not found.");
            }

            // Default TenantId if not provided
            if (secondaryContact.TenantId == 0)
            {
                 secondaryContact.TenantId = 1;
            }

            secondaryContact.CreatedAt = DateTime.UtcNow;
            _context.SecondaryContacts.Add(secondaryContact);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSecondaryContact", new { id = secondaryContact.Id }, secondaryContact);
        }

        // PUT: api/SecondaryContacts/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSecondaryContact(int id, SecondaryContact secondaryContact)
        {
            if (id != secondaryContact.Id)
            {
                return BadRequest();
            }

            // Preserve CreatedAt
            var existing = await _context.SecondaryContacts.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (existing != null)
            {
                secondaryContact.CreatedAt = existing.CreatedAt;
            }

            secondaryContact.UpdatedAt = DateTime.UtcNow;
            _context.Entry(secondaryContact).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SecondaryContactExists(id))
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

        // DELETE: api/SecondaryContacts/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSecondaryContact(int id)
        {
            var secondaryContact = await _context.SecondaryContacts.FindAsync(id);
            if (secondaryContact == null)
            {
                return NotFound();
            }

            _context.SecondaryContacts.Remove(secondaryContact);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SecondaryContactExists(int id)
        {
            return _context.SecondaryContacts.Any(e => e.Id == id);
        }
    }
}
