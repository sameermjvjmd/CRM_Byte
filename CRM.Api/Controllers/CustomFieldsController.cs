using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CRM.Api.DTOs.CustomFields;
using CRM.Api.Services;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CustomFieldsController : ControllerBase
    {
        private readonly ICustomFieldService _customFieldService;

        public CustomFieldsController(ICustomFieldService customFieldService)
        {
            _customFieldService = customFieldService;
        }

        [HttpGet("{entityType}")]
        public async Task<ActionResult<List<CustomFieldDto>>> GetCustomFields(string entityType)
        {
            var fields = await _customFieldService.GetCustomFieldsAsync(entityType);
            return Ok(fields);
        }

        [HttpGet("field/{id}")]
        public async Task<ActionResult<CustomFieldDto>> GetCustomField(int id)
        {
            var field = await _customFieldService.GetCustomFieldByIdAsync(id);
            if (field == null) return NotFound();
            return Ok(field);
        }

        [HttpPost]
        public async Task<ActionResult<CustomFieldDto>> CreateCustomField(CreateCustomFieldDto dto)
        {
            var userId = GetUserId();
            var field = await _customFieldService.CreateCustomFieldAsync(dto, userId);
            return CreatedAtAction(nameof(GetCustomField), new { id = field.Id }, field);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<CustomFieldDto>> UpdateCustomField(int id, UpdateCustomFieldDto dto)
        {
            try
            {
                var userId = GetUserId();
                var field = await _customFieldService.UpdateCustomFieldAsync(id, dto, userId);
                return Ok(field);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomField(int id)
        {
            var result = await _customFieldService.DeleteCustomFieldAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpGet("{entityType}/{entityId}/values")]
        public async Task<ActionResult<List<CustomFieldValueDto>>> GetEntityValues(string entityType, int entityId)
        {
            var values = await _customFieldService.GetEntityCustomFieldValuesAsync(entityType, entityId);
            return Ok(values);
        }

        [HttpPost("{entityType}/{entityId}/values")]
        public async Task<IActionResult> SaveEntityValues(string entityType, int entityId, [FromBody] SaveCustomFieldValuesDto dto)
        {
            // Note: Dictionary<string, object> deserialization can be tricky.
            // System.Text.Json deserializes 'object' as 'JsonElement'.
            // The service handles JsonElement conversion.
            await _customFieldService.SaveEntityCustomFieldValuesAsync(entityType, entityId, dto.Values!);
            return Ok();
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            // Fallback for dev/testing if token structure differs (or throw)
            return 0; 
        }
    }
}
