using System;
using System.Collections.Generic;

namespace CRM.Api.Models
{
    public class ContactWebInfo
    {
        public int Id { get; set; }
        public int ContactId { get; set; }
        
        // Primary Websites
        public string? Website { get; set; }
        public string? Blog { get; set; }
        public string? Portfolio { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation
        public virtual Contact Contact { get; set; } = null!;
        public virtual ICollection<ContactWebLink> CustomLinks { get; set; } = new List<ContactWebLink>();
    }
    
    public class ContactWebLink
    {
        public int Id { get; set; }
        public int ContactWebInfoId { get; set; }
        
        public string Label { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string Type { get; set; } = "business"; // personal, business, social, other
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation
        public virtual ContactWebInfo ContactWebInfo { get; set; } = null!;
    }
}
