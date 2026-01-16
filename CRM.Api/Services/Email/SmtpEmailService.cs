using System.Net;
using System.Net.Mail;
using CRM.Api.Data;
using CRM.Api.Models;
using CRM.Api.Models.Email;
using Microsoft.EntityFrameworkCore;

namespace CRM.Api.Services.Email
{
    public class SmtpEmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SmtpEmailService> _logger;
        private readonly CRM.Api.Services.Security.IEncryptionService _encryptionService;

        public SmtpEmailService(
            IConfiguration configuration, 
            ApplicationDbContext context, 
            ILogger<SmtpEmailService> logger,
            CRM.Api.Services.Security.IEncryptionService encryptionService)
        {
            _configuration = configuration;
            _context = context;
            _logger = logger;
            _encryptionService = encryptionService;
        }

        /// <summary>
        /// Get SMTP settings - first checks tenant-specific DB settings, then falls back to appsettings.json
        /// </summary>
        private async Task<SmtpSettings> GetSmtpSettingsAsync()
        {
            // First, try to get tenant-specific settings from database
            var tenantSettings = await _context.TenantEmailSettings
                .Where(s => s.IsDefault && s.IsActive)
                .FirstOrDefaultAsync();

            if (tenantSettings != null)
            {
                _logger.LogDebug("Using tenant-specific SMTP settings");
                return new SmtpSettings
                {
                    Host = tenantSettings.SmtpHost,
                    Port = tenantSettings.SmtpPort,
                    Username = tenantSettings.SmtpUsername,
                    Password = _encryptionService.Decrypt(tenantSettings.SmtpPassword),
                    EnableSsl = tenantSettings.EnableSsl,
                    FromEmail = tenantSettings.FromEmail,
                    FromName = tenantSettings.FromName
                };
            }

            // Fall back to global settings from appsettings.json
            _logger.LogDebug("Using global SMTP settings from configuration");
            var smtpSection = _configuration.GetSection("SmtpSettings");
            return new SmtpSettings
            {
                Host = smtpSection["Host"] ?? "smtp.gmail.com",
                Port = int.Parse(smtpSection["Port"] ?? "587"),
                Username = smtpSection["Username"] ?? "",
                Password = smtpSection["Password"] ?? "",
                EnableSsl = bool.Parse(smtpSection["EnableSsl"] ?? "true"),
                FromEmail = smtpSection["FromEmail"] ?? smtpSection["Username"] ?? "",
                FromName = smtpSection["FromName"] ?? "CRM System"
            };
        }

        // =============================================
        // Basic email sending
        // =============================================
        public async Task SendEmailAsync(string to, string subject, string body, bool isHtml = true)
        {
            await SendEmailAsync(to, subject, body, isHtml, null, null, null);
        }

        // =============================================
        // Enhanced email with CC, BCC, and attachments
        // =============================================
        public async Task SendEmailAsync(
            string to, 
            string subject, 
            string body, 
            bool isHtml,
            string? cc,
            string? bcc,
            List<string>? attachmentPaths = null)
        {
            try
            {
                var settings = await GetSmtpSettingsAsync();

                using var client = new SmtpClient(settings.Host, settings.Port)
                {
                    Credentials = new NetworkCredential(settings.Username, settings.Password),
                    EnableSsl = settings.EnableSsl
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(settings.FromEmail, settings.FromName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = isHtml
                };

                // Add recipients
                foreach (var recipient in to.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries))
                {
                    mailMessage.To.Add(recipient.Trim());
                }

                // Add CC
                if (!string.IsNullOrWhiteSpace(cc))
                {
                    foreach (var ccRecipient in cc.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries))
                    {
                        mailMessage.CC.Add(ccRecipient.Trim());
                    }
                }

                // Add BCC
                if (!string.IsNullOrWhiteSpace(bcc))
                {
                    foreach (var bccRecipient in bcc.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries))
                    {
                        mailMessage.Bcc.Add(bccRecipient.Trim());
                    }
                }

                // Add attachments
                if (attachmentPaths != null && attachmentPaths.Any())
                {
                    foreach (var path in attachmentPaths)
                    {
                        if (File.Exists(path))
                        {
                            mailMessage.Attachments.Add(new Attachment(path));
                        }
                        else
                        {
                            _logger.LogWarning("Attachment file not found: {Path}", path);
                        }
                    }
                }

                await client.SendMailAsync(mailMessage);
                _logger.LogInformation("Email sent successfully to {To} via {Host} with {AttachmentCount} attachments", 
                    to, settings.Host, attachmentPaths?.Count ?? 0);

                // Dispose attachments
                foreach (var attachment in mailMessage.Attachments)
                {
                    attachment.Dispose();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {To}", to);
                throw;
            }
        }

        // =============================================
        // Template-based email
        // =============================================
        public async Task SendEmailWithTemplateAsync(string to, int templateId, Dictionary<string, string> placeholders)
        {
            var template = await _context.EmailTemplates.FindAsync(templateId);
            if (template == null)
            {
                throw new Exception("Email template not found.");
            }

            var subject = ReplacePlaceholders(template.Subject, placeholders);
            var body = ReplacePlaceholders(template.Body, placeholders);

            await SendEmailAsync(to, subject, body, true);
        }

        // =============================================
        // Record sent email to database
        // =============================================
        public async Task<SentEmail> RecordSentEmailAsync(SentEmail sentEmail)
        {
            _context.SentEmails.Add(sentEmail);
            await _context.SaveChangesAsync();
            return sentEmail;
        }

        // =============================================
        // Process scheduled emails (background job)
        // =============================================
        public async Task ProcessScheduledEmailsAsync()
        {
            var pendingEmails = await _context.ScheduledEmails
                .Where(e => e.Status == "Pending" && e.ScheduledFor <= DateTime.UtcNow)
                .ToListAsync();

            foreach (var email in pendingEmails)
            {
                try
                {
                    await SendEmailAsync(email.To, email.Subject, email.Body, true, email.Cc, email.Bcc);
                    
                    email.Status = "Sent";
                    email.ProcessedAt = DateTime.UtcNow;

                    // Record in sent emails
                    var sentEmail = new SentEmail
                    {
                        To = email.To,
                        Cc = email.Cc,
                        Bcc = email.Bcc,
                        Subject = email.Subject,
                        Body = email.Body,
                        SentAt = DateTime.UtcNow,
                        SentByUserId = email.CreatedByUserId,
                        Status = "Sent",
                        ContactId = email.ContactId,
                        TemplateId = email.TemplateId,
                        IsScheduled = true,
                        ScheduledFor = email.ScheduledFor,
                        ScheduleSent = true,
                        RequestReadReceipt = email.RequestReadReceipt,
                        Tracking = new EmailTracking()
                    };

                    _context.SentEmails.Add(sentEmail);
                    _logger.LogInformation("Scheduled email sent to {To}", email.To);
                }
                catch (Exception ex)
                {
                    email.Status = "Failed";
                    email.ErrorMessage = ex.Message;
                    email.ProcessedAt = DateTime.UtcNow;
                    _logger.LogError(ex, "Failed to send scheduled email {Id} to {To}", email.Id, email.To);
                }
            }

            await _context.SaveChangesAsync();
        }

        // =============================================
        // Helper Methods
        // =============================================
        private string ReplacePlaceholders(string text, Dictionary<string, string> placeholders)
        {
            if (string.IsNullOrEmpty(text)) return text;

            foreach (var placeholder in placeholders)
            {
                text = text.Replace($"{{{{{placeholder.Key}}}}}", placeholder.Value);
            }
            return text;
        }

        /// <summary>
        /// Internal class to hold SMTP settings
        /// </summary>
        private class SmtpSettings
        {
            public string Host { get; set; } = string.Empty;
            public int Port { get; set; }
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public bool EnableSsl { get; set; }
            public string FromEmail { get; set; } = string.Empty;
            public string FromName { get; set; } = string.Empty;
        }
    }
}
