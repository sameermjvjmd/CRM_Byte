using System.ComponentModel.DataAnnotations;

namespace CRM.Api.Models
{
    /// <summary>
    /// Represents an email address for a contact.
    /// Contacts can have multiple email addresses (primary, secondary, work, personal, etc.)
    /// </summary>
    public class ContactEmail
    {
        public int Id { get; set; }

        /// <summary>
        /// Contact this email belongs to
        /// </summary>
        public int ContactId { get; set; }
        public Contact? Contact { get; set; }

        /// <summary>
        /// The email address
        /// </summary>
        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Type of email (Work, Personal, Other)
        /// </summary>
        [StringLength(50)]
        public string EmailType { get; set; } = "Work";

        /// <summary>
        /// Display label for this email
        /// </summary>
        [StringLength(100)]
        public string? Label { get; set; }

        /// <summary>
        /// Whether this is the primary email for the contact
        /// </summary>
        public bool IsPrimary { get; set; } = false;

        /// <summary>
        /// Whether this email allows marketing communications
        /// </summary>
        public bool AllowMarketing { get; set; } = true;

        /// <summary>
        /// Whether this email has opted out of communications
        /// </summary>
        public bool OptedOut { get; set; } = false;

        /// <summary>
        /// Whether this email has been verified
        /// </summary>
        public bool IsVerified { get; set; } = false;

        /// <summary>
        /// Date when the email bounced (if applicable)
        /// </summary>
        public DateTime? BouncedAt { get; set; }

        /// <summary>
        /// Sort order for display
        /// </summary>
        public int SortOrder { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }

    /// <summary>
    /// Standard email types
    /// </summary>
    public static class EmailTypes
    {
        public const string Work = "Work";
        public const string Personal = "Personal";
        public const string Other = "Other";
        public const string Assistant = "Assistant";
        public const string Alternate = "Alternate";

        public static List<string> All => new List<string>
        {
            Work, Personal, Other, Assistant, Alternate
        };
    }
}
