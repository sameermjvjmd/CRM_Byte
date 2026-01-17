using System.ComponentModel.DataAnnotations;
using CRM.Api.Models.Auth;

namespace CRM.Api.Models
{
    public class SavedSearch
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string EntityType { get; set; } = "Contact"; // Contact, Company, Opportunity

        [Required]
        public string CriteriaJson { get; set; } = string.Empty; // Serialized list of criteria

        public string Description { get; set; } = string.Empty;

        public bool IsPublic { get; set; } = false;

        public int UserId { get; set; }
        public User? User { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastUsedAt { get; set; }
    }
}
