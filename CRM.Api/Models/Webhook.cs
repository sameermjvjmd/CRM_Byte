namespace CRM.Api.Models
{
    /// <summary>
    /// Webhook configuration for sending real-time event notifications to external systems
    /// </summary>
    public class Webhook
    {
        public int Id { get; set; }
        
        /// <summary>
        /// Friendly name for the webhook
        /// </summary>
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// URL endpoint to send webhook payloads to
        /// </summary>
        public string Url { get; set; } = string.Empty;
        
        /// <summary>
        /// Comma-separated list of events to subscribe to
        /// Examples: contact.created, contact.updated, deal.won, email.sent
        /// </summary>
        public string Events { get; set; } = string.Empty;
        
        /// <summary>
        /// Secret key for signing webhook payloads (HMAC-SHA256)
        /// </summary>
        public string Secret { get; set; } = string.Empty;
        
        /// <summary>
        /// Whether this webhook is active
        /// </summary>
        public bool IsActive { get; set; } = true;
        
        /// <summary>
        /// Description of what this webhook does
        /// </summary>
        public string? Description { get; set; }
        
        /// <summary>
        /// Number of times this webhook has been triggered
        /// </summary>
        public int TriggerCount { get; set; } = 0;
        
        /// <summary>
        /// Last time this webhook was successfully triggered
        /// </summary>
        public DateTime? LastTriggeredAt { get; set; }
        
        /// <summary>
        /// Last error message if webhook failed
        /// </summary>
        public string? LastError { get; set; }
        
        /// <summary>
        /// Number of consecutive failures
        /// </summary>
        public int FailureCount { get; set; } = 0;
        
        /// <summary>
        /// Custom headers to send with webhook requests (JSON)
        /// </summary>
        public string? CustomHeaders { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }

    /// <summary>
    /// Log of webhook delivery attempts
    /// </summary>
    public class WebhookLog
    {
        public int Id { get; set; }
        public int WebhookId { get; set; }
        public string EventType { get; set; } = string.Empty;
        public string Payload { get; set; } = string.Empty;
        public int StatusCode { get; set; }
        public string? Response { get; set; }
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
        public int AttemptNumber { get; set; } = 1;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public Webhook? Webhook { get; set; }
    }
}
