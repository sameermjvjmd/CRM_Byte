using System.ComponentModel.DataAnnotations;

namespace CRM.Api.Models
{
    public class Campaign
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(200)]
        public string Subject { get; set; } = string.Empty;

        [StringLength(20)]
        public string Type { get; set; } = "Email"; // Email, SMS

        [StringLength(20)]
        public string Status { get; set; } = "Draft"; // Draft, Scheduled, Sending, Sent, Archived

        public string Content { get; set; } = string.Empty; // HTML Content

        // Scheduling
        public DateTime? ScheduledAt { get; set; }
        public DateTime? SentAt { get; set; }

        // Stats (Simple counters for now)
        public int RecipientCount { get; set; }
        public int SentCount { get; set; }
        public int OpenedCount { get; set; }
        public int ClickedCount { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? CreatedByUserId { get; set; }
    }
}
