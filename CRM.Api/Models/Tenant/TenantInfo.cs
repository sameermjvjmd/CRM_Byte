using System.ComponentModel.DataAnnotations;

namespace CRM.Api.Models.Tenant
{
    /// <summary>
    /// Represents a tenant (customer organization) in the SaaS system.
    /// Each tenant gets their own subdomain and database.
    /// </summary>
    public class TenantInfo
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Subdomain { get; set; } = string.Empty; // e.g., "bytesymphony"

        [Required]
        [StringLength(200)]
        public string CompanyName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string DatabaseName { get; set; } = string.Empty; // e.g., "NexusCRM_ByteSymphony"

        [StringLength(500)]
        public string? ConnectionString { get; set; } // Full connection string

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Trial"; // Trial, Active, Suspended, Cancelled

        [StringLength(50)]
        public string Plan { get; set; } = "Free"; // Free, Pro, Enterprise

        // Limits
        public int MaxUsers { get; set; } = 5; // Free tier limit

        // Dates
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? TrialEndsAt { get; set; }
        public DateTime? SubscriptionEndsAt { get; set; }

        // Admin contact
        [Required]
        [EmailAddress]
        [StringLength(200)]
        public string AdminEmail { get; set; } = string.Empty;

        [StringLength(200)]
        public string? AdminName { get; set; }

        // Settings (JSON)
        public string? Settings { get; set; }

        // Branding
        [StringLength(500)]
        public string? LogoUrl { get; set; }

        [StringLength(7)]
        public string? PrimaryColor { get; set; } // e.g., "#6366f1"
    }
}
