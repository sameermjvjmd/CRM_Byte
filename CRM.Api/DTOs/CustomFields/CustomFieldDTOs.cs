namespace CRM.Api.DTOs.CustomFields
{
    public class CustomFieldDto
    {
        public int Id { get; set; }
        public string EntityType { get; set; } = string.Empty;
        public string FieldName { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string FieldType { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public bool IsActive { get; set; }
        public string? DefaultValue { get; set; }
        public List<ValidationRule>? ValidationRules { get; set; }
        public List<FieldOption>? Options { get; set; }
        public int DisplayOrder { get; set; }
        public string? SectionName { get; set; }
        public string? HelpText { get; set; }
    }

    public class CreateCustomFieldDto
    {
        public string EntityType { get; set; } = string.Empty;
        public string FieldName { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string FieldType { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public string? DefaultValue { get; set; }
        public List<ValidationRule>? ValidationRules { get; set; }
        public List<FieldOption>? Options { get; set; }
        public string? SectionName { get; set; }
        public string? HelpText { get; set; }
    }

    public class UpdateCustomFieldDto
    {
        public string DisplayName { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public bool IsActive { get; set; }
        public string? DefaultValue { get; set; }
        public List<ValidationRule>? ValidationRules { get; set; }
        public List<FieldOption>? Options { get; set; }
        public int DisplayOrder { get; set; }
        public string? SectionName { get; set; }
        public string? HelpText { get; set; }
    }

    public class CustomFieldValueDto
    {
        public int CustomFieldId { get; set; }
        public string FieldName { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string FieldType { get; set; } = string.Empty;
        public object? Value { get; set; }
    }

    public class SaveCustomFieldValuesDto
    {
        public Dictionary<string, object?> Values { get; set; } = new();
    }

    public class ValidationRule
    {
        public string Type { get; set; } = string.Empty; // MinLength, MaxLength, Pattern, Min, Max, etc.
        public string? Value { get; set; }
        public string? Message { get; set; }
    }

    public class FieldOption
    {
        public string Label { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
    }
}
