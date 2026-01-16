using System.ComponentModel.DataAnnotations;

namespace CRM.Api.Models.Email
{
    public class EmailSignature
    {
        public int Id { get; set; }

        public int CreatedBy { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Content { get; set; } = string.Empty;
        
        public bool IsDefault { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
