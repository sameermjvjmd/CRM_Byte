using System;

namespace CRM.Api.Models
{
    public class AuditLog
    {
        public int Id { get; set; }
        public int? UserId { get; set; } // Nullable if system action or anonymous
        public string? UserName { get; set; } // Snapshot of username in case user is deleted
        public string Action { get; set; } = string.Empty; // Create, Update, Delete, Login, etc.
        public string EntityName { get; set; } = string.Empty; // Table name or Feature
        public string? EntityId { get; set; } // ID of the specific record
        public string? Changes { get; set; } // JSON string of old/new values
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? IpAddress { get; set; }
    }
}
