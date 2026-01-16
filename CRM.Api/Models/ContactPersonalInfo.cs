using System;

namespace CRM.Api.Models
{
    public class ContactPersonalInfo
    {
        public int Id { get; set; }
        public int ContactId { get; set; }
        
        // Important Dates
        public DateTime? DateOfBirth { get; set; }
        public DateTime? Anniversary { get; set; }
        
        // Family
        public string? Spouse { get; set; }
        public string? Children { get; set; }
        
        // Professional
        public string? Education { get; set; }
        
        // Personal Details
        public string? Hobbies { get; set; }
        public string? Achievements { get; set; }
        public string? PersonalNotes { get; set; }
        
        // Social Media
        public string? LinkedIn { get; set; }
        public string? Twitter { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation
        public virtual Contact Contact { get; set; } = null!;
    }
}
