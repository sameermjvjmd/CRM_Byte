using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CRM.Api.Models
{
    /// <summary>
    /// Represents a relationship between two contacts (e.g., Spouse, Colleague, Manager)
    /// Act! CRM Week 4 Feature
    /// </summary>
    public class ContactRelationship
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int TenantId { get; set; }

        /// <summary>
        /// The primary contact in the relationship
        /// </summary>
        [Required]
        public int ContactId { get; set; }

        /// <summary>
        /// The related contact
        /// </summary>
        [Required]
        public int RelatedContactId { get; set; }

        /// <summary>
        /// Type of relationship: Spouse, Partner, Colleague, Manager, Assistant, Friend, Family, Other
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string RelationshipType { get; set; } = string.Empty;

        /// <summary>
        /// Optional notes about the relationship
        /// </summary>
        [MaxLength(500)]
        public string? Notes { get; set; }

        /// <summary>
        /// Is this the primary relationship for this contact?
        /// </summary>
        public bool IsPrimary { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        [ForeignKey("ContactId")]
        public virtual Contact? Contact { get; set; }

        [ForeignKey("RelatedContactId")]
        public virtual Contact? RelatedContact { get; set; }
    }
}
