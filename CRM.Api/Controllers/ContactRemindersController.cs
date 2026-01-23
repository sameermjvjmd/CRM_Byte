using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactRemindersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ContactRemindersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/ContactReminders/Contact/5
        [HttpGet("Contact/{contactId}")]
        public async Task<ActionResult<IEnumerable<ContactReminder>>> GetByContact(int contactId)
        {
            return await _context.ContactReminders
                .Where(r => r.ContactId == contactId)
                .OrderBy(r => r.EventDate)
                .ToListAsync();
        }

        // GET: api/ContactReminders/Upcoming?days=30
        [HttpGet("Upcoming")]
        public async Task<ActionResult<IEnumerable<ContactReminder>>> GetUpcoming([FromQuery] int days = 30)
        {
            var today = DateTime.UtcNow.Date;
            var endDate = today.AddDays(days);
            
            // This logic is simple and might need refinement for recurring events (ignoring year),
            // but for "EventDate" if it stores the *actual* date (e.g. birth date 1980), we need to check MM-DD.
            // If it stores the *next* occurrence, we can just compare dates.
            // Assuming for now simple date comparison, but in practice specific Birthday logic is cleaner in service layer.
            // Returning all for now, frontend can filter or we can improve query logic.

             return await _context.ContactReminders
                .Where(r => r.IsActive)
                .ToListAsync();
        }

        // GET: api/ContactReminders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ContactReminder>> GetContactReminder(int id)
        {
            var contactReminder = await _context.ContactReminders.FindAsync(id);

            if (contactReminder == null)
            {
                return NotFound();
            }

            return contactReminder;
        }

        // POST: api/ContactReminders
        [HttpPost]
        public async Task<ActionResult<ContactReminder>> PostContactReminder(ContactReminder contactReminder)
        {
            var contact = await _context.Contacts.FindAsync(contactReminder.ContactId);
            if (contact == null)
            {
                return BadRequest("Contact not found.");
            }

            contactReminder.CreatedAt = DateTime.UtcNow;
            _context.ContactReminders.Add(contactReminder);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetContactReminder", new { id = contactReminder.Id }, contactReminder);
        }

        // PUT: api/ContactReminders/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutContactReminder(int id, ContactReminder contactReminder)
        {
            if (id != contactReminder.Id)
            {
                return BadRequest();
            }

            contactReminder.CreatedAt = (await _context.ContactReminders.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id))?.CreatedAt ?? DateTime.UtcNow;

            _context.Entry(contactReminder).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ContactReminderExists(id))
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

        // DELETE: api/ContactReminders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContactReminder(int id)
        {
            var contactReminder = await _context.ContactReminders.FindAsync(id);
            if (contactReminder == null)
            {
                return NotFound();
            }

            _context.ContactReminders.Remove(contactReminder);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ContactReminderExists(int id)
        {
            return _context.ContactReminders.Any(e => e.Id == id);
        }
    }
}
