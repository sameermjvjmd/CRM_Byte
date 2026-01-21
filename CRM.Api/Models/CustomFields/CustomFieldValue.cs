namespace CRM.Api.Models.CustomFields
{
    public class CustomFieldValue
    {
        public int Id { get; set; }
        public int CustomFieldId { get; set; }
        public int EntityId { get; set; } // ID of Contact, Company, etc.
        public string EntityType { get; set; } = string.Empty;
        
        // Store different value types
        public string? TextValue { get; set; }
        public decimal? NumberValue { get; set; }
        public DateTime? DateValue { get; set; }
        public bool? BooleanValue { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public CustomField? CustomField { get; set; }
    }
}
