using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using NewFields = CRM.Api.Models.CustomFields;
using System.Text.Json;

namespace CRM.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CustomFieldsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CustomFieldsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/customfields/Contact
    [HttpGet("{entityType}")]
    public async Task<ActionResult<IEnumerable<NewFields.CustomField>>> GetAll(string entityType)
    {
        var fields = await _context.AppCustomFields
            .Where(f => f.EntityType == entityType && f.IsActive)
            .OrderBy(f => f.DisplayOrder)
            .ToListAsync();

        return Ok(fields);
    }

    // GET: api/customfields/field/5
    [HttpGet("field/{id}")]
    public async Task<ActionResult<NewFields.CustomField>> GetById(int id)
    {
        var field = await _context.AppCustomFields.FindAsync(id);

        if (field == null)
        {
            return NotFound();
        }

        return Ok(field);
    }

    // POST: api/customfields
    [HttpPost]
    public async Task<ActionResult<NewFields.CustomField>> Create([FromBody] NewFields.CustomField field)
    {
        field.CreatedAt = DateTime.UtcNow;

        // Check if field already exists
        var exists = await _context.AppCustomFields
            .AnyAsync(f => f.EntityType == field.EntityType && f.FieldName == field.FieldName);

        if (exists)
        {
            return BadRequest(new { title = "A field with this name already exists for this entity type." });
        }

        try
        {
            _context.AppCustomFields.Add(field);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = field.Id }, field);
        }
        catch (Exception ex)
        {
            // Log detailed error for debugging
            Console.WriteLine($"Error creating custom field: {ex.Message}");
            Console.WriteLine($"Inner Exception: {ex.InnerException?.Message}");
            
            return BadRequest(new { 
                title = "Error creating custom field",
                detail = ex.InnerException?.Message ?? ex.Message
            });
        }
    }

    // PUT: api/customfields/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] NewFields.CustomField field)
    {
        if (id != field.Id)
        {
            return BadRequest();
        }

        var existingField = await _context.AppCustomFields.FindAsync(id);
        if (existingField == null)
        {
            return NotFound();
        }

        // Update properties
        existingField.DisplayName = field.DisplayName;
        existingField.IsRequired = field.IsRequired;
        existingField.IsActive = field.IsActive;
        existingField.Options = field.Options;
        existingField.DisplayOrder = field.DisplayOrder;
        existingField.SectionName = field.SectionName;
        existingField.HelpText = field.HelpText;
        existingField.DefaultValue = field.DefaultValue;
        existingField.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.AppCustomFields.AnyAsync(f => f.Id == id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/customfields/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var field = await _context.AppCustomFields.FindAsync(id);

        if (field == null)
        {
            return NotFound();
        }

        // Delete all associated values first
        var values = await _context.AppCustomFieldValues
            .Where(v => v.CustomFieldId == id)
            .ToListAsync();

        _context.AppCustomFieldValues.RemoveRange(values);
        _context.AppCustomFields.Remove(field);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/customfields/Contact/123/values
    [HttpGet("{entityType}/{entityId}/values")]
    public async Task<ActionResult<IEnumerable<NewFields.CustomFieldValue>>> GetEntityValues(string entityType, int entityId)
    {
        var values = await _context.AppCustomFieldValues
            .Include(v => v.CustomField)
            .Where(v => v.EntityType == entityType && v.EntityId == entityId)
            .ToListAsync();

        return Ok(values);
    }

    // POST: api/customfields/Contact/123/values
    [HttpPost("{entityType}/{entityId}/values")]
    public async Task<IActionResult> SaveEntityValues(string entityType, int entityId, [FromBody] Dictionary<int, string> values)
    {
        // Delete existing values for this entity
        var existingValues = await _context.AppCustomFieldValues
            .Where(v => v.EntityType == entityType && v.EntityId == entityId)
            .ToListAsync();

        _context.AppCustomFieldValues.RemoveRange(existingValues);

        // Add new values
        foreach (var kvp in values)
        {
            var fieldValue = new NewFields.CustomFieldValue
            {
                CustomFieldId = kvp.Key,
                EntityType = entityType,
                EntityId = entityId,
                Value = kvp.Value,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.AppCustomFieldValues.Add(fieldValue);
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }
}
