namespace CRM.Api.Models.CustomFields
{
    public class CustomField
    {
        public int Id { get; set; }
        public string EntityType { get; set; } = string.Empty; // Contact, Company, Opportunity
        public string FieldName { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public CustomFieldType FieldType { get; set; }
        public bool IsRequired { get; set; }
        public bool IsActive { get; set; } = true;
        public string? DefaultValue { get; set; }
        public string? ValidationRules { get; set; } // JSON
        public string? Options { get; set; } // JSON for dropdown options
        public int DisplayOrder { get; set; }
        public string? SectionName { get; set; }
        public string? HelpText { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public ICollection<CustomFieldValue> Values { get; set; } = new List<CustomFieldValue>();
    }

    public enum CustomFieldType
    {
        Text = 0,
        Textarea = 1,
        Number = 2,
        Decimal = 3,
        Date = 4,
        DateTime = 5,
        Dropdown = 6,
        MultiSelect = 7,
        Checkbox = 8,
        URL = 9,
        Email = 10,
        Phone = 11,
        Currency = 12,
        Percentage = 13
    }
}
