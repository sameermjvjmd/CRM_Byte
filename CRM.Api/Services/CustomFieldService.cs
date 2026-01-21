using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.DTOs.CustomFields;
using NewFields = CRM.Api.Models.CustomFields;

namespace CRM.Api.Services
{
    public interface ICustomFieldService
    {
        Task<List<CustomFieldDto>> GetCustomFieldsAsync(string entityType);
        Task<CustomFieldDto?> GetCustomFieldByIdAsync(int id);
        Task<CustomFieldDto> CreateCustomFieldAsync(CreateCustomFieldDto dto, int userId);
        Task<CustomFieldDto> UpdateCustomFieldAsync(int id, UpdateCustomFieldDto dto, int userId);
        Task<bool> DeleteCustomFieldAsync(int id);
        Task<List<CustomFieldValueDto>> GetEntityCustomFieldValuesAsync(string entityType, int entityId);
        Task SaveEntityCustomFieldValuesAsync(string entityType, int entityId, Dictionary<string, object?> values);
    }

    public class CustomFieldService : ICustomFieldService
    {
        private readonly ApplicationDbContext _context;

        public CustomFieldService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<CustomFieldDto>> GetCustomFieldsAsync(string entityType)
        {
            var fields = await _context.AppCustomFields
                .Where(f => f.EntityType == entityType && f.IsActive)
                .OrderBy(f => f.DisplayOrder)
                .ToListAsync();

            return fields.Select(MapToDto).ToList();
        }

        public async Task<CustomFieldDto?> GetCustomFieldByIdAsync(int id)
        {
            var field = await _context.AppCustomFields.FindAsync(id);
            if (field == null) return null;

            return MapToDto(field);
        }

        public async Task<CustomFieldDto> CreateCustomFieldAsync(CreateCustomFieldDto dto, int userId)
        {
            var field = new NewFields.CustomField
            {
                EntityType = dto.EntityType,
                FieldName = dto.FieldName,
                DisplayName = dto.DisplayName,
                FieldType = Enum.Parse<NewFields.CustomFieldType>(dto.FieldType),
                IsRequired = dto.IsRequired,
                IsActive = true,
                DefaultValue = dto.DefaultValue,
                ValidationRules = dto.ValidationRules != null ? JsonSerializer.Serialize(dto.ValidationRules) : null,
                Options = dto.Options != null ? JsonSerializer.Serialize(dto.Options) : null,
                DisplayOrder = 100, // Default to end
                SectionName = dto.SectionName,
                HelpText = dto.HelpText,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.AppCustomFields.Add(field);
            await _context.SaveChangesAsync();

            return MapToDto(field);
        }

        public async Task<CustomFieldDto> UpdateCustomFieldAsync(int id, UpdateCustomFieldDto dto, int userId)
        {
            var field = await _context.AppCustomFields.FindAsync(id);
            if (field == null) throw new KeyNotFoundException($"Custom field with ID {id} not found.");

            field.DisplayName = dto.DisplayName;
            field.IsRequired = dto.IsRequired;
            field.IsActive = dto.IsActive;
            field.DefaultValue = dto.DefaultValue;
            field.ValidationRules = dto.ValidationRules != null ? JsonSerializer.Serialize(dto.ValidationRules) : null;
            field.Options = dto.Options != null ? JsonSerializer.Serialize(dto.Options) : null;
            field.DisplayOrder = dto.DisplayOrder;
            field.SectionName = dto.SectionName;
            field.HelpText = dto.HelpText;
            field.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(field);
        }

        public async Task<bool> DeleteCustomFieldAsync(int id)
        {
            var field = await _context.AppCustomFields.FindAsync(id);
            if (field == null) return false;

            // Soft delete or Hard delete? Hard delete for now as per DTO implies management.
            // Or set IsActive = false?
            // Let's do hard delete to keep clean for MVP, assuming checks are done.
            // But usually fields should be soft deleted or deactivated.
            // Let's deactivate if it has values? No, MVP hard delete is simpler for "Delete" button.
            
            _context.AppCustomFields.Remove(field);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<CustomFieldValueDto>> GetEntityCustomFieldValuesAsync(string entityType, int entityId)
        {
            var fields = await _context.AppCustomFields
                .Where(f => f.EntityType == entityType && f.IsActive)
                .ToListAsync();

            var values = await _context.AppCustomFieldValues
                .Where(v => v.EntityType == entityType && v.EntityId == entityId)
                .ToListAsync();

            var result = new List<CustomFieldValueDto>();

            foreach (var field in fields)
            {
                var val = values.FirstOrDefault(v => v.CustomFieldId == field.Id);
                result.Add(new CustomFieldValueDto
                {
                    CustomFieldId = field.Id,
                    FieldName = field.FieldName,
                    DisplayName = field.DisplayName,
                    FieldType = field.FieldType.ToString(),
                    Value = GetValue(val, field.FieldType)
                });
            }

            return result;
        }

        public async Task SaveEntityCustomFieldValuesAsync(string entityType, int entityId, Dictionary<string, object?> inputValues)
        {
            var fields = await _context.AppCustomFields
                .Where(f => f.EntityType == entityType)
                .ToListAsync();

            var existingValues = await _context.AppCustomFieldValues
                .Where(v => v.EntityType == entityType && v.EntityId == entityId)
                .ToListAsync();

            foreach (var field in fields)
            {
                if (inputValues.TryGetValue(field.FieldName, out var val))
                {
                    var existingVal = existingValues.FirstOrDefault(v => v.CustomFieldId == field.Id);
                    
                    if (existingVal == null)
                    {
                        if (val == null) continue; // Don't create empty records

                        existingVal = new NewFields.CustomFieldValue
                        {
                            CustomFieldId = field.Id,
                            EntityId = entityId,
                            EntityType = entityType,
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.AppCustomFieldValues.Add(existingVal);
                    }
                    else
                    {
                        existingVal.UpdatedAt = DateTime.UtcNow;
                    }

                    SetValue(existingVal, field.FieldType, val);
                }
            }

            await _context.SaveChangesAsync();
        }

        private CustomFieldDto MapToDto(NewFields.CustomField field)
        {
            return new CustomFieldDto
            {
                Id = field.Id,
                EntityType = field.EntityType,
                FieldName = field.FieldName,
                DisplayName = field.DisplayName,
                FieldType = field.FieldType.ToString(),
                IsRequired = field.IsRequired,
                IsActive = field.IsActive,
                DefaultValue = field.DefaultValue,
                ValidationRules = !string.IsNullOrEmpty(field.ValidationRules) 
                    ? JsonSerializer.Deserialize<List<ValidationRule>>(field.ValidationRules) 
                    : new List<ValidationRule>(),
                Options = !string.IsNullOrEmpty(field.Options) 
                    ? JsonSerializer.Deserialize<List<FieldOption>>(field.Options) 
                    : new List<FieldOption>(),
                DisplayOrder = field.DisplayOrder,
                SectionName = field.SectionName,
                HelpText = field.HelpText
            };
        }

        private object? GetValue(NewFields.CustomFieldValue? val, NewFields.CustomFieldType type)
        {
            if (val == null) return null;

            return type switch
            {
                NewFields.CustomFieldType.Number => val.NumberValue,
                NewFields.CustomFieldType.Decimal => val.NumberValue,
                NewFields.CustomFieldType.Currency => val.NumberValue,
                NewFields.CustomFieldType.Percentage => val.NumberValue,
                NewFields.CustomFieldType.Date => val.DateValue,
                NewFields.CustomFieldType.DateTime => val.DateValue,
                NewFields.CustomFieldType.Checkbox => val.BooleanValue,
                _ => val.TextValue
            };
        }

        private void SetValue(NewFields.CustomFieldValue entity, NewFields.CustomFieldType type, object? value)
        {
            // Reset all
            entity.TextValue = null;
            entity.NumberValue = null;
            entity.DateValue = null;
            entity.BooleanValue = null;

            if (value == null) return;

            JsonElement? jsonElement = value as JsonElement?;
            
            // Handle JsonElement from Controller deserialization
            if (value is JsonElement j)
            {
                jsonElement = j;
            }

            switch (type)
            {
                case NewFields.CustomFieldType.Number:
                case NewFields.CustomFieldType.Decimal:
                case NewFields.CustomFieldType.Currency:
                case NewFields.CustomFieldType.Percentage:
                    if (jsonElement.HasValue && jsonElement.Value.ValueKind == JsonValueKind.Number)
                        entity.NumberValue = jsonElement.Value.GetDecimal();
                    else if (decimal.TryParse(value.ToString(), out var d))
                        entity.NumberValue = d;
                    break;

                case NewFields.CustomFieldType.Date:
                case NewFields.CustomFieldType.DateTime:
                    if (jsonElement.HasValue && jsonElement.Value.ValueKind == JsonValueKind.String)
                        entity.DateValue = DateTime.Parse(jsonElement.Value.GetString()!);
                    else if (DateTime.TryParse(value.ToString(), out var dt))
                        entity.DateValue = dt;
                    break;

                case NewFields.CustomFieldType.Checkbox:
                    if (jsonElement.HasValue && (jsonElement.Value.ValueKind == JsonValueKind.True || jsonElement.Value.ValueKind == JsonValueKind.False))
                        entity.BooleanValue = jsonElement.Value.GetBoolean();
                    else if (bool.TryParse(value.ToString(), out var b))
                        entity.BooleanValue = b;
                    break;

                default:
                    entity.TextValue = value.ToString();
                    break;
            }
        }
    }
}
