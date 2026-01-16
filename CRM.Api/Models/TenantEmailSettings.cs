using System.ComponentModel.DataAnnotations;

namespace CRM.Api.Models
{
    /// <summary>
    /// Tenant-specific email settings for SaaS multi-tenancy.
    /// Each tenant can configure their own SMTP settings.
    /// </summary>
    public class TenantEmailSettings
    {
        public int Id { get; set; }

        /// <summary>
        /// Tenant this configuration belongs to (optional - null means default/global)
        /// </summary>
        public int? TenantId { get; set; }

        /// <summary>
        /// SMTP server hostname (e.g., smtp.gmail.com, smtp.office365.com)
        /// </summary>
        [Required]
        [StringLength(200)]
        public string SmtpHost { get; set; } = string.Empty;

        /// <summary>
        /// SMTP port (typically 587 for TLS, 465 for SSL, 25 for unencrypted)
        /// </summary>
        public int SmtpPort { get; set; } = 587;

        /// <summary>
        /// SMTP username (usually the email address)
        /// </summary>
        [Required]
        [StringLength(200)]
        public string SmtpUsername { get; set; } = string.Empty;

        /// <summary>
        /// SMTP password (should be encrypted in production)
        /// For Gmail, this should be an App Password if 2FA is enabled
        /// </summary>
        [Required]
        [StringLength(500)]
        public string SmtpPassword { get; set; } = string.Empty;

        /// <summary>
        /// Enable SSL/TLS encryption
        /// </summary>
        public bool EnableSsl { get; set; } = true;

        /// <summary>
        /// Email address to send from
        /// </summary>
        [Required]
        [EmailAddress]
        [StringLength(200)]
        public string FromEmail { get; set; } = string.Empty;

        /// <summary>
        /// Display name for outgoing emails
        /// </summary>
        [StringLength(200)]
        public string FromName { get; set; } = string.Empty;

        /// <summary>
        /// Reply-to email address (optional, defaults to FromEmail)
        /// </summary>
        [EmailAddress]
        [StringLength(200)]
        public string? ReplyToEmail { get; set; }

        /// <summary>
        /// Whether this configuration is active
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Whether this is the default configuration for the tenant
        /// </summary>
        public bool IsDefault { get; set; } = true;

        /// <summary>
        /// Email provider type for easier configuration
        /// </summary>
        [StringLength(50)]
        public string ProviderType { get; set; } = "Custom"; // Gmail, Office365, Custom, etc.

        /// <summary>
        /// Whether connection has been verified
        /// </summary>
        public bool IsVerified { get; set; } = false;

        /// <summary>
        /// Last verification timestamp
        /// </summary>
        public DateTime? LastVerifiedAt { get; set; }

        /// <summary>
        /// Last verification error message (if any)
        /// </summary>
        [StringLength(1000)]
        public string? LastVerificationError { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public int? CreatedBy { get; set; }
    }
}
