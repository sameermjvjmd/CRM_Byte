using System.ComponentModel.DataAnnotations;

namespace CRM.Api.Models.Email
{
    public class EmailTemplate
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [StringLength(200)]
        public string Subject { get; set; } = string.Empty;
        
        [Required]
        public string Body { get; set; } = string.Empty; // HTML content
        
        [StringLength(50)]
        public string Category { get; set; } = "General";
        
        public string? DesignJson { get; set; } // Stores the JSON state of the visual builder
        
        public bool IsActive { get; set; } = true;
        public int CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
