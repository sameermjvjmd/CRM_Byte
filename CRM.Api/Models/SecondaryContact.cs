using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CRM.Api.Models
{
    /// <summary>
    /// Represents an additional contact person for a primary contact
    /// (e.g., Assistant, Alternate contact, Emergency contact)
    /// Act! CRM Week 4 Feature
    /// </summary>
    public class SecondaryContact
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int TenantId { get; set; }

        /// <summary>
        /// The primary contact this secondary contact belongs to
        /// </summary>
        [Required]
        public int PrimaryContactId { get; set; }

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Title { get; set; }

        [MaxLength(100)]
        public string? Department { get; set; }

        /// <summary>
        /// Role: Assistant, Alternate, Emergency, Billing Contact, Technical Contact, etc.
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string Role { get; set; } = "Alternate";

        [MaxLength(50)]
        public string? Phone { get; set; }

        [MaxLength(50)]
        public string? Mobile { get; set; }

        [MaxLength(100)]
        public string? Email { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        /// <summary>
        /// Is this the primary secondary contact?
        /// </summary>
        public bool IsPrimary { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation property
        [ForeignKey("PrimaryContactId")]
        public virtual Contact? PrimaryContact { get; set; }
    }
}
