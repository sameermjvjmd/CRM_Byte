using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomFieldsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CustomFieldsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/CustomFields/Contact
        [HttpGet("{entityType}")]
        public async Task<ActionResult<IEnumerable<CustomFieldDefinition>>> GetFields(string entityType)
        {
            return await _context.CustomFieldDefinitions
                .Where(f => f.EntityType == entityType && f.IsActive)
                .OrderBy(f => f.SortOrder)
                .ToListAsync();
        }

        // POST: api/CustomFields
        [HttpPost]
        public async Task<ActionResult<CustomFieldDefinition>> CreateField(CustomFieldDefinition field)
        {
            field.CreatedAt = DateTime.UtcNow;
            
            // Auto-generate FieldKey if empty
            if (string.IsNullOrEmpty(field.FieldKey))
            {
                field.FieldKey = field.FieldName.ToLower().Replace(" ", "_");
            }

            _context.CustomFieldDefinitions.Add(field);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetFields), new { entityType = field.EntityType }, field);
        }

        // PUT: api/CustomFields/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateField(int id, CustomFieldDefinition field)
        {
            if (id != field.Id)
            {
                return BadRequest();
            }

            var existingField = await _context.CustomFieldDefinitions.FindAsync(id);
            if (existingField == null)
            {
                return NotFound();
            }

            // Update properties
            existingField.FieldName = field.FieldName;
            existingField.FieldType = field.FieldType;
            existingField.OptionsJson = field.OptionsJson;
            existingField.IsRequired = field.IsRequired;
            existingField.SortOrder = field.SortOrder;
            existingField.IsActive = field.IsActive;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FieldExists(id))
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

        // DELETE: api/CustomFields/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteField(int id)
        {
            var field = await _context.CustomFieldDefinitions.FindAsync(id);
            if (field == null)
            {
                return NotFound();
            }

            // Soft delete
            field.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FieldExists(int id)
        {
            return _context.CustomFieldDefinitions.Any(e => e.Id == id);
        }
    }
}
