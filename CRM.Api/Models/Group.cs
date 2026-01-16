using System.ComponentModel.DataAnnotations;

namespace CRM.Api.Models
{
    public class Group
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        // Hierarchy support
        public int? ParentGroupId { get; set; }
        public Group? ParentGroup { get; set; }
        public ICollection<Group> SubGroups { get; set; } = new List<Group>();

        // Membership
        public bool IsDynamic { get; set; } = false;
        public string? DynamicQuery { get; set; } // Stores filter logic
        
        // Additional fields for UI
        public string? Category { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Relationship: Many-to-Many with Contacts
        public ICollection<Contact> Contacts { get; set; } = new List<Contact>();
    }
}
