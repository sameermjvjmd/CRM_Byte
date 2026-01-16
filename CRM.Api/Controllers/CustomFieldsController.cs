using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/contacts/{contactId}/customfields")]
    public class CustomFieldsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CustomFieldsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/contacts/{contactId}/customfields
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ContactCustomField>>> GetCustomFields(int contactId)
        {
            return await _context.ContactCustomFields
                .Where(f => f.ContactId == contactId)
                .OrderBy(f => f.CreatedAt)
                .ToListAsync();
        }

        // PUT: api/contacts/{contactId}/customfields
        [HttpPut]
        public async Task<IActionResult> UpdateCustomFields(int contactId, List<ContactCustomField> fields)
        {
            // Simple approach: Delete all existing for this contact and re-add provided ones
            // This is efficient enough for small numbers of custom fields per contact
            var existing = await _context.ContactCustomFields
                .Where(f => f.ContactId == contactId)
                .ToListAsync();
            
            _context.ContactCustomFields.RemoveRange(existing);

            foreach (var field in fields)
            {
                // Reset ID to ensure it's treated as new
                field.Id = 0; 
                field.ContactId = contactId;
                if (field.CreatedAt == default) field.CreatedAt = DateTime.UtcNow;
                _context.ContactCustomFields.Add(field);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
