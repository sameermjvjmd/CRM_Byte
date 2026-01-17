using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CRM.Api.Models
{
    public class Contact
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        // Primary email (legacy - for backward compatibility)
        [EmailAddress]
        [StringLength(255)]
        public string? Email { get; set; }

        [Phone]
        [StringLength(20)]
        public string? Phone { get; set; }

        [StringLength(200)]
        public string? JobTitle { get; set; }
        
        // Relationship to Company
        public int? CompanyId { get; set; }
        public Company? Company { get; set; }

        // Relationship to Group (Many-to-Many)
        public ICollection<Group> Groups { get; set; } = new List<Group>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastModifiedAt { get; set; } = DateTime.UtcNow;

        public string? LeadSource { get; set; }
        public string? Status { get; set; }
        public string? Notes { get; set; }

        // Primary Address (legacy - for backward compatibility)
        [StringLength(100)]
        public string? Address1 { get; set; }
        
        [StringLength(100)]
        public string? Address2 { get; set; }
        
        [StringLength(50)]
        public string? City { get; set; }
        
        [StringLength(50)]
        public string? State { get; set; }
        
        [StringLength(20)]
        public string? Zip { get; set; }
        
        // Custom Fields (Runtime only)
        [NotMapped]
        public IEnumerable<CustomFieldValue>? CustomValues { get; set; }
        
        [StringLength(50)]
        public string? Country { get; set; }

        [StringLength(100)]
        public string? ReferredBy { get; set; }

        [StringLength(100)]
        public string? Department { get; set; }
        
        public string? PreferredContactMethod { get; set; }

        // Act! CRM Fields
        [StringLength(20)]
        public string? Salutation { get; set; } // Mr., Ms., Mrs., Dr., Prof.

        [Phone]
        [StringLength(20)]
        public string? MobilePhone { get; set; }

        [Phone]
        [StringLength(20)]
        public string? Fax { get; set; }

        [StringLength(10)]
        public string? PhoneExtension { get; set; }

        public int? ReferredById { get; set; } // Foreign key to another Contact

        public string? LastResult { get; set; } // Last interaction outcome

        [StringLength(255)]
        public string? Website { get; set; }

        // Contact Photo
        [StringLength(500)]
        public string? PhotoUrl { get; set; }

        // Contact Source for tracking
        [StringLength(100)]
        public string? ContactSource { get; set; }

        // =============================================
        // Multiple Email Addresses (Week 1)
        // =============================================
        public ICollection<ContactEmail> ContactEmails { get; set; } = new List<ContactEmail>();

        // =============================================
        // Multiple Addresses (Week 1)
        // =============================================
        public ICollection<ContactAddress> ContactAddresses { get; set; } = new List<ContactAddress>();

        // =============================================
        // Helper Properties
        // =============================================

        /// <summary>
        /// Full name of the contact
        /// </summary>
        [NotMapped]
        public string FullName => $"{FirstName} {LastName}".Trim();

        /// <summary>
        /// Gets the primary email from ContactEmails or falls back to Email field
        /// </summary>
        [NotMapped]
        public string? PrimaryEmail => ContactEmails?.FirstOrDefault(e => e.IsPrimary)?.Email ?? Email;

        /// <summary>
        /// Gets the primary address from ContactAddresses or falls back to legacy fields
        /// </summary>
        [NotMapped]
        public ContactAddress? PrimaryAddress => ContactAddresses?.FirstOrDefault(a => a.IsPrimary);
    }
}

