using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CRM.Api.Models
{
    /// <summary>
    /// Represents automatic reminders for birthdays, anniversaries, and other important dates
    /// Act! CRM Week 4 Feature
    /// </summary>
    public class ContactReminder
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int TenantId { get; set; }

        [Required]
        public int ContactId { get; set; }

        /// <summary>
        /// Type: Birthday, Anniversary, Custom
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string ReminderType { get; set; } = string.Empty;

        /// <summary>
        /// The date to remind about (without year for recurring)
        /// </summary>
        [Required]
        public DateTime EventDate { get; set; }

        /// <summary>
        /// How many days before to send reminder
        /// </summary>
        public int DaysBefore { get; set; } = 7;

        /// <summary>
        /// Custom title for the reminder
        /// </summary>
        [MaxLength(200)]
        public string? Title { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        /// <summary>
        /// Is this reminder active?
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Should this reminder recur annually?
        /// </summary>
        public bool IsRecurring { get; set; } = true;

        /// <summary>
        /// Last time this reminder was triggered
        /// </summary>
        public DateTime? LastTriggered { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        [ForeignKey("ContactId")]
        public virtual Contact? Contact { get; set; }
    }
}
