namespace CRM.Api.DTOs.Email
{
    /// <summary>
    /// Request to send bulk/mail merge emails to multiple recipients
    /// </summary>
    public class BulkEmailRequest
    {
        /// <summary>
        /// List of contact IDs to send emails to
        /// </summary>
        public List<int> ContactIds { get; set; } = new();

        /// <summary>
        /// Email template ID to use
        /// </summary>
        public int? TemplateId { get; set; }

        /// <summary>
        /// Email subject (if not using template or overriding template subject)
        /// </summary>
        public string? Subject { get; set; }

        /// <summary>
        /// Email body (if not using template or overriding template body)
        /// </summary>
        public string? Body { get; set; }

        /// <summary>
        /// Attachment IDs to include in all emails
        /// </summary>
        public List<int>? AttachmentIds { get; set; }

        /// <summary>
        /// Whether to request read receipts
        /// </summary>
        public bool RequestReadReceipt { get; set; }

        /// <summary>
        /// Send emails immediately or schedule for later
        /// </summary>
        public DateTime? ScheduledFor { get; set; }

        /// <summary>
        /// BCC address to include in all emails (optional)
        /// </summary>
        public string? Bcc { get; set; }
    }

    /// <summary>
    /// Response after sending bulk emails
    /// </summary>
    public class BulkEmailResponse
    {
        /// <summary>
        /// Total number of emails attempted
        /// </summary>
        public int TotalAttempted { get; set; }

        /// <summary>
        /// Number of emails successfully sent
        /// </summary>
        public int SuccessfullySent { get; set; }

        /// <summary>
        /// Number of emails that failed
        /// </summary>
        public int Failed { get; set; }

        /// <summary>
        /// Number of emails scheduled
        /// </summary>
        public int Scheduled { get; set; }

        /// <summary>
        /// Details of each email sent
        /// </summary>
        public List<BulkEmailResult> Results { get; set; } = new();

        /// <summary>
        /// Any errors encountered
        /// </summary>
        public List<string> Errors { get; set; } = new();
    }

    /// <summary>
    /// Result for individual email in bulk send
    /// </summary>
    public class BulkEmailResult
    {
        public int ContactId { get; set; }
        public string ContactName { get; set; } = string.Empty;
        public string EmailAddress { get; set; } = string.Empty;
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
        public int? SentEmailId { get; set; }
    }
}
