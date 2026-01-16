using System;

namespace CRM.Api.Models
{
    public class ContactCustomField
    {
        public int Id { get; set; }
        public int ContactId { get; set; }
        
        public string Label { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Type { get; set; } = "text"; // text, number, date, checkbox
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation
        public virtual Contact Contact { get; set; } = null!;
    }
}
