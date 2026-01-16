namespace CRM.Api.DTOs.Email
{
    /// <summary>
    /// DTO for displaying email settings
    /// </summary>
    public class TenantEmailSettingsDto
    {
        public int Id { get; set; }
        public string SmtpHost { get; set; } = string.Empty;
        public int SmtpPort { get; set; }
        public string SmtpUsername { get; set; } = string.Empty;
        public bool EnableSsl { get; set; }
        public string FromEmail { get; set; } = string.Empty;
        public string FromName { get; set; } = string.Empty;
        public string? ReplyToEmail { get; set; }
        public bool IsActive { get; set; }
        public bool IsDefault { get; set; }
        public string ProviderType { get; set; } = "Custom";
        public bool IsVerified { get; set; }
        public DateTime? LastVerifiedAt { get; set; }
        public string? LastVerificationError { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// DTO for creating email settings
    /// </summary>
    public class CreateTenantEmailSettingsDto
    {
        public string SmtpHost { get; set; } = string.Empty;
        public int SmtpPort { get; set; } = 587;
        public string SmtpUsername { get; set; } = string.Empty;
        public string SmtpPassword { get; set; } = string.Empty;
        public bool EnableSsl { get; set; } = true;
        public string FromEmail { get; set; } = string.Empty;
        public string FromName { get; set; } = string.Empty;
        public string? ReplyToEmail { get; set; }
        public string ProviderType { get; set; } = "Custom";
    }

    /// <summary>
    /// DTO for updating email settings
    /// </summary>
    public class UpdateTenantEmailSettingsDto
    {
        public string? SmtpHost { get; set; }
        public int? SmtpPort { get; set; }
        public string? SmtpUsername { get; set; }
        public string? SmtpPassword { get; set; }
        public bool? EnableSsl { get; set; }
        public string? FromEmail { get; set; }
        public string? FromName { get; set; }
        public string? ReplyToEmail { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDefault { get; set; }
        public string? ProviderType { get; set; }
    }

    /// <summary>
    /// Response for email verification test
    /// </summary>
    public class EmailVerificationResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime TestedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Pre-configured SMTP provider options
    /// </summary>
    public class SmtpProviderPreset
    {
        public string Name { get; set; } = string.Empty;
        public string SmtpHost { get; set; } = string.Empty;
        public int SmtpPort { get; set; }
        public bool EnableSsl { get; set; }
        public string Instructions { get; set; } = string.Empty;
    }
}
