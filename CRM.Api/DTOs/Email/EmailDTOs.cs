using System.ComponentModel.DataAnnotations;

namespace CRM.Api.DTOs.Email
{
    public class EmailTemplateDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string Category { get; set; } = "General";
        public bool IsActive { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateEmailTemplateDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string Body { get; set; } = string.Empty;

        [StringLength(50)]
        public string Category { get; set; } = "General";
    }

    public class UpdateEmailTemplateDto : CreateEmailTemplateDto
    {
        public bool IsActive { get; set; }
    }

    public class EmailSignatureDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateEmailSignatureDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public bool IsDefault { get; set; }
    }

    public class UpdateEmailSignatureDto : CreateEmailSignatureDto
    {
    }

    // =============================================
    // Send Email Request (Enhanced)
    // =============================================
    public class SendEmailRequest
    {
        [Required]
        public string To { get; set; } = string.Empty;
        
        public string? Cc { get; set; }
        public string? Bcc { get; set; }
        
        [Required]
        public string Subject { get; set; } = string.Empty;
        
        [Required]
        public string Body { get; set; } = string.Empty;
        
        public int? TemplateId { get; set; }
        public Dictionary<string, string>? Placeholders { get; set; }
        
        public int? ContactId { get; set; }
        
        // Attachments
        public List<int>? AttachmentIds { get; set; }
        
        // Scheduling
        public DateTime? ScheduledFor { get; set; }
        public string? Timezone { get; set; }
        
        // Read Receipt
        public bool RequestReadReceipt { get; set; } = false;
    }

    // =============================================
    // Sent Email DTO (Enhanced)
    // =============================================
    public class SentEmailDto
    {
        public int Id { get; set; }
        public string To { get; set; } = string.Empty;
        public string? Cc { get; set; }
        public string? Bcc { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public int? ContactId { get; set; }
        public string? ContactName { get; set; }
        public int? TemplateId { get; set; }
        public string? TemplateName { get; set; }
        public int OpenCount { get; set; }
        public int ClickCount { get; set; }
        
        // Attachments
        public bool HasAttachments { get; set; }
        public int AttachmentCount { get; set; }
        
        // Read Receipt
        public bool RequestedReadReceipt { get; set; }
        public bool ReadReceiptReceived { get; set; }
    }

    // =============================================
    // Email Attachment DTO
    // =============================================
    public class EmailAttachmentDto
    {
        public int Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string? ContentType { get; set; }
        public long FileSize { get; set; }
        public DateTime UploadedAt { get; set; }
    }

    // =============================================
    // Scheduled Email DTO
    // =============================================
    public class ScheduledEmailDto
    {
        public int Id { get; set; }
        public string To { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public DateTime ScheduledFor { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public int? ContactId { get; set; }
        public string? Timezone { get; set; }
    }

    // =============================================
    // Email Stats DTO
    // =============================================
    public class EmailStatsDto
    {
        public int TotalSent { get; set; }
        public int TotalOpened { get; set; }
        public int TotalClicked { get; set; }
        public int TotalBounced { get; set; }
        public int TotalFailed { get; set; }
        public int ScheduledPending { get; set; }
        public double OpenRate { get; set; }
        public double ClickRate { get; set; }
        public int ReadReceiptsReceived { get; set; }
        public int WithAttachments { get; set; }
    }
}
