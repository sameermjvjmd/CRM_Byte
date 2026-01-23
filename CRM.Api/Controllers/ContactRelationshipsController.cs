using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactRelationshipsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ContactRelationshipsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/ContactRelationships/Contact/5
        [HttpGet("Contact/{contactId}")]
        public async Task<ActionResult<IEnumerable<ContactRelationship>>> GetByContact(int contactId)
        {
            return await _context.ContactRelationships
                .Include(r => r.RelatedContact)
                .Where(r => r.ContactId == contactId)
                .OrderByDescending(r => r.IsPrimary)
                .ThenBy(r => r.RelationshipType)
                .ToListAsync();
        }

        // GET: api/ContactRelationships/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ContactRelationship>> GetContactRelationship(int id)
        {
            var contactRelationship = await _context.ContactRelationships
                .Include(r => r.RelatedContact)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (contactRelationship == null)
            {
                return NotFound();
            }

            return contactRelationship;
        }

        // POST: api/ContactRelationships
        [HttpPost]
        public async Task<ActionResult<ContactRelationship>> PostContactRelationship(ContactRelationship contactRelationship)
        {
            // Verify contacts exist
            var contact = await _context.Contacts.FindAsync(contactRelationship.ContactId);
            var relatedContact = await _context.Contacts.FindAsync(contactRelationship.RelatedContactId);

            if (contact == null || relatedContact == null)
            {
                return BadRequest("One or both contacts not found.");
            }

            if (contactRelationship.ContactId == contactRelationship.RelatedContactId)
            {
                 return BadRequest("Cannot create a relationship with self.");
            }

            contactRelationship.CreatedAt = DateTime.UtcNow;
            _context.ContactRelationships.Add(contactRelationship);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetContactRelationship", new { id = contactRelationship.Id }, contactRelationship);
        }

        // PUT: api/ContactRelationships/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutContactRelationship(int id, ContactRelationship contactRelationship)
        {
            if (id != contactRelationship.Id)
            {
                return BadRequest();
            }

             var existing = await _context.ContactRelationships.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (existing != null)
            {
                contactRelationship.CreatedAt = existing.CreatedAt;
            }

            contactRelationship.UpdatedAt = DateTime.UtcNow;
            _context.Entry(contactRelationship).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ContactRelationshipExists(id))
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

        // DELETE: api/ContactRelationships/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContactRelationship(int id)
        {
            var contactRelationship = await _context.ContactRelationships.FindAsync(id);
            if (contactRelationship == null)
            {
                return NotFound();
            }

            _context.ContactRelationships.Remove(contactRelationship);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ContactRelationshipExists(int id)
        {
            return _context.ContactRelationships.Any(e => e.Id == id);
        }
    }
}
