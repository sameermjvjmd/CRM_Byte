using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;
using CRM.Api.DTOs.Email;
using System.Net;
using System.Net.Mail;
using System.Security.Claims;

namespace CRM.Api.Controllers
{
    /// <summary>
    /// Controller for managing tenant-specific email/SMTP settings.
    /// Each tenant can configure their own email provider for SaaS multi-tenancy.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EmailSettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailSettingsController> _logger;
        private readonly CRM.Api.Services.Security.IEncryptionService _encryptionService;

        public EmailSettingsController(
            ApplicationDbContext context,
            IConfiguration configuration,
            ILogger<EmailSettingsController> logger,
            CRM.Api.Services.Security.IEncryptionService encryptionService)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
            _encryptionService = encryptionService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId) ? userId : 0;
        }

        /// <summary>
        /// Get current tenant's email settings
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<TenantEmailSettingsDto>> GetEmailSettings()
        {
            var settings = await _context.TenantEmailSettings
                .Where(s => s.IsDefault)
                .FirstOrDefaultAsync();

            if (settings == null)
            {
                // Return default from appsettings if no tenant settings configured
                var smtpSettings = _configuration.GetSection("SmtpSettings");
                return Ok(new TenantEmailSettingsDto
                {
                    Id = 0,
                    SmtpHost = smtpSettings["Host"] ?? "smtp.gmail.com",
                    SmtpPort = int.Parse(smtpSettings["Port"] ?? "587"),
                    SmtpUsername = smtpSettings["Username"] ?? "",
                    EnableSsl = bool.Parse(smtpSettings["EnableSsl"] ?? "true"),
                    FromEmail = smtpSettings["FromEmail"] ?? "",
                    FromName = smtpSettings["FromName"] ?? "CRM System",
                    IsActive = true,
                    IsDefault = true,
                    ProviderType = "Custom",
                    IsVerified = false
                });
            }

            return Ok(MapToDto(settings));
        }

        /// <summary>
        /// Create or update tenant email settings
        /// </summary>
        [HttpPost]
        [Authorize(Policy = "admin.settings")]
        public async Task<ActionResult<TenantEmailSettingsDto>> SaveEmailSettings([FromBody] CreateTenantEmailSettingsDto dto)
        {
            var userId = GetCurrentUserId();

            // Check if settings already exist
            var existingSettings = await _context.TenantEmailSettings
                .Where(s => s.IsDefault)
                .FirstOrDefaultAsync();

            if (existingSettings != null)
            {
                // Update existing
                existingSettings.SmtpHost = dto.SmtpHost;
                existingSettings.SmtpPort = dto.SmtpPort;
                existingSettings.SmtpUsername = dto.SmtpUsername;
                if (!string.IsNullOrEmpty(dto.SmtpPassword))
                {
                    existingSettings.SmtpPassword = _encryptionService.Encrypt(dto.SmtpPassword);
                }
                existingSettings.EnableSsl = dto.EnableSsl;
                existingSettings.FromEmail = dto.FromEmail;
                existingSettings.FromName = dto.FromName;
                existingSettings.ReplyToEmail = dto.ReplyToEmail;
                existingSettings.ProviderType = dto.ProviderType;
                existingSettings.UpdatedAt = DateTime.UtcNow;
                existingSettings.IsVerified = false; // Reset verification on update

                await _context.SaveChangesAsync();
                _logger.LogInformation("Email settings updated by user {UserId}", userId);
                return Ok(MapToDto(existingSettings));
            }
            else
            {
                // Create new
                var settings = new TenantEmailSettings
                {
                    SmtpHost = dto.SmtpHost,
                    SmtpPort = dto.SmtpPort,
                    SmtpUsername = dto.SmtpUsername,
                    SmtpPassword = _encryptionService.Encrypt(dto.SmtpPassword),
                    EnableSsl = dto.EnableSsl,
                    FromEmail = dto.FromEmail,
                    FromName = dto.FromName,
                    ReplyToEmail = dto.ReplyToEmail,
                    ProviderType = dto.ProviderType,
                    IsActive = true,
                    IsDefault = true,
                    CreatedBy = userId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.TenantEmailSettings.Add(settings);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Email settings created by user {UserId}", userId);
                return CreatedAtAction(nameof(GetEmailSettings), MapToDto(settings));
            }
        }

        /// <summary>
        /// Test/Verify email settings by sending a test email
        /// </summary>
        [HttpPost("test")]
        [Authorize(Policy = "admin.settings")]
        public async Task<ActionResult<EmailVerificationResult>> TestEmailSettings([FromBody] CreateTenantEmailSettingsDto dto)
        {
            try
            {
                using var client = new SmtpClient(dto.SmtpHost, dto.SmtpPort)
                {
                    Credentials = new NetworkCredential(dto.SmtpUsername, dto.SmtpPassword),
                    EnableSsl = dto.EnableSsl,
                    Timeout = 15000 // 15 seconds timeout
                };

                var testEmail = new MailMessage
                {
                    From = new MailAddress(dto.FromEmail, dto.FromName),
                    Subject = "NexusCRM - Email Configuration Test",
                    Body = @"
<html>
<body style='font-family: Arial, sans-serif; padding: 20px;'>
<h2 style='color: #4F46E5;'>✅ Email Configuration Successful!</h2>
<p>This is a test email from your <strong>NexusCRM</strong> system.</p>
<p>Your SMTP settings are configured correctly and working.</p>
<hr>
<p style='color: #666; font-size: 12px;'>
SMTP Host: " + dto.SmtpHost + @"<br>
SMTP Port: " + dto.SmtpPort + @"<br>
From: " + dto.FromEmail + @"<br>
Sent at: " + DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC") + @"
</p>
</body>
</html>",
                    IsBodyHtml = true
                };

                testEmail.To.Add(dto.FromEmail); // Send to self for testing

                await client.SendMailAsync(testEmail);

                // Update verification status in database if settings exist
                var existingSettings = await _context.TenantEmailSettings
                    .Where(s => s.IsDefault)
                    .FirstOrDefaultAsync();

                if (existingSettings != null)
                {
                    existingSettings.IsVerified = true;
                    existingSettings.LastVerifiedAt = DateTime.UtcNow;
                    existingSettings.LastVerificationError = null;
                    await _context.SaveChangesAsync();
                }

                _logger.LogInformation("Email test successful to {Email}", dto.FromEmail);

                return Ok(new EmailVerificationResult
                {
                    Success = true,
                    Message = $"Test email sent successfully to {dto.FromEmail}. Please check your inbox."
                });
            }
            catch (SmtpException ex)
            {
                _logger.LogWarning(ex, "SMTP test failed for {Host}:{Port}", dto.SmtpHost, dto.SmtpPort);

                // Update verification status
                var existingSettings = await _context.TenantEmailSettings
                    .Where(s => s.IsDefault)
                    .FirstOrDefaultAsync();

                if (existingSettings != null)
                {
                    existingSettings.IsVerified = false;
                    existingSettings.LastVerifiedAt = DateTime.UtcNow;
                    existingSettings.LastVerificationError = ex.Message;
                    await _context.SaveChangesAsync();
                }

                return BadRequest(new EmailVerificationResult
                {
                    Success = false,
                    Message = GetFriendlySmtpError(ex)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Email test failed unexpectedly");
                return BadRequest(new EmailVerificationResult
                {
                    Success = false,
                    Message = "Failed to send test email: " + ex.Message
                });
            }
        }

        /// <summary>
        /// Get list of pre-configured SMTP provider presets
        /// </summary>
        [HttpGet("providers")]
        public ActionResult<List<SmtpProviderPreset>> GetSmtpProviders()
        {
            var providers = new List<SmtpProviderPreset>
            {
                new SmtpProviderPreset
                {
                    Name = "Gmail",
                    SmtpHost = "smtp.gmail.com",
                    SmtpPort = 587,
                    EnableSsl = true,
                    Instructions = "Use your Gmail address and an App Password (not your regular password). Enable 2-Step Verification and create an App Password at myaccount.google.com/apppasswords"
                },
                new SmtpProviderPreset
                {
                    Name = "Microsoft 365 / Outlook",
                    SmtpHost = "smtp.office365.com",
                    SmtpPort = 587,
                    EnableSsl = true,
                    Instructions = "Use your Microsoft 365 email and password. You may need to enable SMTP AUTH in your Microsoft 365 admin center."
                },
                new SmtpProviderPreset
                {
                    Name = "Yahoo Mail",
                    SmtpHost = "smtp.mail.yahoo.com",
                    SmtpPort = 587,
                    EnableSsl = true,
                    Instructions = "Use your Yahoo email and an App Password. Generate one at login.yahoo.com/account/security"
                },
                new SmtpProviderPreset
                {
                    Name = "Zoho Mail",
                    SmtpHost = "smtp.zoho.com",
                    SmtpPort = 587,
                    EnableSsl = true,
                    Instructions = "Use your Zoho email and password. Enable SMTP access in your Zoho Mail settings."
                },
                new SmtpProviderPreset
                {
                    Name = "SendGrid",
                    SmtpHost = "smtp.sendgrid.net",
                    SmtpPort = 587,
                    EnableSsl = true,
                    Instructions = "Use 'apikey' as username and your SendGrid API key as password."
                },
                new SmtpProviderPreset
                {
                    Name = "Mailgun",
                    SmtpHost = "smtp.mailgun.org",
                    SmtpPort = 587,
                    EnableSsl = true,
                    Instructions = "Use your Mailgun SMTP credentials from your domain settings."
                },
                new SmtpProviderPreset
                {
                    Name = "Amazon SES",
                    SmtpHost = "email-smtp.us-east-1.amazonaws.com",
                    SmtpPort = 587,
                    EnableSsl = true,
                    Instructions = "Use your IAM SMTP credentials. Verify your sender email in SES console first."
                },
                new SmtpProviderPreset
                {
                    Name = "Custom SMTP",
                    SmtpHost = "",
                    SmtpPort = 587,
                    EnableSsl = true,
                    Instructions = "Enter your custom SMTP server details provided by your email hosting provider."
                }
            };

            return Ok(providers);
        }

        /// <summary>
        /// Delete tenant email settings (revert to global defaults)
        /// </summary>
        [HttpDelete]
        [Authorize(Policy = "admin.settings")]
        public async Task<IActionResult> DeleteEmailSettings()
        {
            var settings = await _context.TenantEmailSettings
                .Where(s => s.IsDefault)
                .FirstOrDefaultAsync();

            if (settings == null)
            {
                return NotFound(new { message = "No custom email settings configured" });
            }

            _context.TenantEmailSettings.Remove(settings);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Email settings deleted by user {UserId}", GetCurrentUserId());

            return Ok(new { message = "Email settings deleted. System will use default configuration." });
        }

        private TenantEmailSettingsDto MapToDto(TenantEmailSettings settings)
        {
            return new TenantEmailSettingsDto
            {
                Id = settings.Id,
                SmtpHost = settings.SmtpHost,
                SmtpPort = settings.SmtpPort,
                SmtpUsername = settings.SmtpUsername,
                EnableSsl = settings.EnableSsl,
                FromEmail = settings.FromEmail,
                FromName = settings.FromName,
                ReplyToEmail = settings.ReplyToEmail,
                IsActive = settings.IsActive,
                IsDefault = settings.IsDefault,
                ProviderType = settings.ProviderType,
                IsVerified = settings.IsVerified,
                LastVerifiedAt = settings.LastVerifiedAt,
                LastVerificationError = settings.LastVerificationError,
                CreatedAt = settings.CreatedAt
            };
        }

        private string GetFriendlySmtpError(SmtpException ex)
        {
            return ex.StatusCode switch
            {
                SmtpStatusCode.MustIssueStartTlsFirst => "TLS/SSL is required. Make sure 'Enable SSL' is checked.",
                SmtpStatusCode.MailboxNameNotAllowed => "The email address is not valid or allowed by the server.",
                SmtpStatusCode.MailboxUnavailable => "The mailbox is unavailable. Check your email address.",
                SmtpStatusCode.ClientNotPermitted => "Authentication failed. Check your username and password. For Gmail, use an App Password.",
                _ => $"SMTP Error ({ex.StatusCode}): {ex.Message}"
            };
        }
    }
}
