using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CRM.Api.Models;

namespace CRM.Api.Models.Email
{
    public class SentEmail
    {
        public int Id { get; set; }
        
        [Required]
        public string To { get; set; } = string.Empty;
        public string? Cc { get; set; }
        public string? Bcc { get; set; }
        
        [Required]
        [StringLength(500)]
        public string Subject { get; set; } = string.Empty;
        
        [Required]
        public string Body { get; set; } = string.Empty;
        
        // =============================================
        // Relationships
        // =============================================
        public int? ContactId { get; set; }
        public Contact? Contact { get; set; }

        public int? TemplateId { get; set; }
        public EmailTemplate? Template { get; set; }

        // =============================================
        // Sender & Timestamps
        // =============================================
        public int SentByUserId { get; set; }
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // =============================================
        // Status
        // =============================================
        [StringLength(50)]
        public string Status { get; set; } = "Sent"; // Sent, Failed, Queued, Scheduled, Delivered, Bounced
        
        [StringLength(1000)]
        public string? ErrorMessage { get; set; }
        
        // =============================================
        // Scheduling (Send Later)
        // =============================================
        public bool IsScheduled { get; set; } = false;
        public DateTime? ScheduledFor { get; set; }
        public bool ScheduleSent { get; set; } = false;
        
        // =============================================
        // Read Receipts
        // =============================================
        public bool RequestReadReceipt { get; set; } = false;
        public bool ReadReceiptReceived { get; set; } = false;
        public DateTime? ReadReceiptAt { get; set; }
        
        // =============================================
        // Attachments
        // =============================================
        public bool HasAttachments { get; set; } = false;
        
        [StringLength(2000)]
        public string? AttachmentsJson { get; set; } // JSON array of attachment info
        
        // =============================================
        // Navigation
        // =============================================
        public EmailTracking? Tracking { get; set; }
        public ICollection<EmailAttachment>? Attachments { get; set; }
    }

    // =============================================
    // Email Attachment Entity
    // =============================================
    public class EmailAttachment
    {
        public int Id { get; set; }
        
        public int SentEmailId { get; set; }
        public SentEmail? SentEmail { get; set; }
        
        [Required]
        [StringLength(255)]
        public string FileName { get; set; } = string.Empty;
        
        [StringLength(100)]
        public string? ContentType { get; set; }
        
        public long FileSize { get; set; } // in bytes
        
        [StringLength(500)]
        public string? StoragePath { get; set; } // Local file path or cloud URL
        
        [StringLength(50)]
        public string StorageType { get; set; } = "Local"; // Local, Azure, S3
        
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }

    // =============================================
    // Scheduled Email Entity
    // =============================================
    public class ScheduledEmail
    {
        public int Id { get; set; }
        
        [Required]
        public string To { get; set; } = string.Empty;
        public string? Cc { get; set; }
        public string? Bcc { get; set; }
        
        [Required]
        [StringLength(500)]
        public string Subject { get; set; } = string.Empty;
        
        [Required]
        public string Body { get; set; } = string.Empty;
        
        public int? ContactId { get; set; }
        public int? TemplateId { get; set; }
        public int CreatedByUserId { get; set; }
        
        public DateTime ScheduledFor { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [StringLength(50)]
        public string Status { get; set; } = "Pending"; // Pending, Sent, Failed, Cancelled
        
        public DateTime? ProcessedAt { get; set; }
        
        [StringLength(1000)]
        public string? ErrorMessage { get; set; }
        
        public bool RequestReadReceipt { get; set; } = false;
        
        [StringLength(2000)]
        public string? AttachmentsJson { get; set; }
        
        // Timezone for display
        [StringLength(100)]
        public string? Timezone { get; set; }
    }

    // =============================================
    // Email Status Constants
    // =============================================
    public static class EmailStatuses
    {
        public const string Queued = "Queued";
        public const string Scheduled = "Scheduled";
        public const string Sending = "Sending";
        public const string Sent = "Sent";
        public const string Delivered = "Delivered";
        public const string Opened = "Opened";
        public const string Clicked = "Clicked";
        public const string Bounced = "Bounced";
        public const string Failed = "Failed";
        public const string Cancelled = "Cancelled";

        public static readonly string[] All = 
        { 
            Queued, Scheduled, Sending, Sent, Delivered, 
            Opened, Clicked, Bounced, Failed, Cancelled 
        };
    }
}
