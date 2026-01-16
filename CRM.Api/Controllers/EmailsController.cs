using CRM.Api.Data;
using CRM.Api.DTOs.Email;
using CRM.Api.Models.Email;
using CRM.Api.Services.Email;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace CRM.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class EmailsController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public EmailsController(
            IEmailService emailService, 
            ApplicationDbContext context,
            IWebHostEnvironment env)
        {
            _emailService = emailService;
            _context = context;
            _env = env;
        }

        // =============================================
        // POST: api/emails/send
        // =============================================
        [HttpPost("send")]
        public async Task<ActionResult<SentEmailDto>> SendEmail(SendEmailRequest request)
        {
            try
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int userId = int.TryParse(userIdStr, out int uid) ? uid : 0;

                // 1. Handle scheduled emails
                if (request.ScheduledFor.HasValue && request.ScheduledFor.Value > DateTime.UtcNow)
                {
                    var scheduledEmail = new ScheduledEmail
                    {
                        To = request.To,
                        Cc = request.Cc,
                        Bcc = request.Bcc,
                        Subject = request.Subject,
                        Body = request.Body,
                        ContactId = request.ContactId,
                        TemplateId = request.TemplateId,
                        CreatedByUserId = userId,
                        ScheduledFor = request.ScheduledFor.Value,
                        CreatedAt = DateTime.UtcNow,
                        Status = "Pending",
                        RequestReadReceipt = request.RequestReadReceipt,
                        AttachmentsJson = request.AttachmentIds != null 
                            ? JsonSerializer.Serialize(request.AttachmentIds) 
                            : null,
                        Timezone = request.Timezone
                    };

                    _context.ScheduledEmails.Add(scheduledEmail);
                    await _context.SaveChangesAsync();

                    return Ok(new SentEmailDto
                    {
                        Id = scheduledEmail.Id,
                        To = scheduledEmail.To,
                        Subject = scheduledEmail.Subject,
                        Status = "Scheduled",
                        SentAt = scheduledEmail.ScheduledFor,
                        ContactId = scheduledEmail.ContactId
                    });
                }

                // 2. Prepare body (handle template if present)
                string subject = request.Subject;
                string body = request.Body;

                if (request.TemplateId.HasValue)
                {
                    var template = await _context.EmailTemplates.FindAsync(request.TemplateId.Value);
                    if (template != null)
                    {
                        if (string.IsNullOrWhiteSpace(subject)) subject = template.Subject;
                        body = ReplacePlaceholders(template.Body, request.Placeholders);
                        subject = ReplacePlaceholders(subject, request.Placeholders);
                    }
                }

                // 3. Prepare attachments
                var attachmentPaths = new List<string>();
                if (request.AttachmentIds?.Any() == true)
                {
                    var attachments = await _context.EmailAttachments
                        .Where(a => request.AttachmentIds.Contains(a.Id))
                        .ToListAsync();
                    attachmentPaths = attachments
                        .Where(a => !string.IsNullOrWhiteSpace(a.StoragePath))
                        .Select(a => a.StoragePath!)
                        .ToList();
                }

                // 4. Add read receipt header if requested
                var headers = new Dictionary<string, string>();
                if (request.RequestReadReceipt)
                {
                    // These headers request read/delivery receipts
                    headers["Disposition-Notification-To"] = request.To;
                    headers["X-Confirm-Reading-To"] = request.To;
                    headers["Return-Receipt-To"] = request.To;
                }

                // 5. Send via SMTP service
                await _emailService.SendEmailAsync(
                    request.To, 
                    subject, 
                    body, 
                    true,
                    request.Cc,
                    request.Bcc,
                    attachmentPaths
                );

                // 6. Record in DB
                var sentEmail = new SentEmail
                {
                    To = request.To,
                    Cc = request.Cc,
                    Bcc = request.Bcc,
                    Subject = subject,
                    Body = body,
                    SentAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    SentByUserId = userId,
                    Status = "Sent",
                    ContactId = request.ContactId,
                    TemplateId = request.TemplateId,
                    HasAttachments = attachmentPaths.Any(),
                    AttachmentsJson = attachmentPaths.Any() 
                        ? JsonSerializer.Serialize(attachmentPaths.Select(Path.GetFileName))
                        : null,
                    RequestReadReceipt = request.RequestReadReceipt,
                    Tracking = new EmailTracking()
                };

                await _emailService.RecordSentEmailAsync(sentEmail);

                // Link attachments to sent email
                if (request.AttachmentIds?.Any() == true)
                {
                    var attachments = await _context.EmailAttachments
                        .Where(a => request.AttachmentIds.Contains(a.Id))
                        .ToListAsync();
                    foreach (var att in attachments)
                    {
                        att.SentEmailId = sentEmail.Id;
                    }
                    await _context.SaveChangesAsync();
                }

                var dto = new SentEmailDto
                {
                    Id = sentEmail.Id,
                    To = sentEmail.To,
                    Cc = sentEmail.Cc,
                    Bcc = sentEmail.Bcc,
                    Subject = sentEmail.Subject,
                    Status = sentEmail.Status,
                    SentAt = sentEmail.SentAt,
                    ContactId = sentEmail.ContactId,
                    TemplateId = sentEmail.TemplateId,
                    HasAttachments = sentEmail.HasAttachments,
                    OpenCount = 0,
                    ClickCount = 0
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to send email", details = ex.Message });
            }
        }

        // =============================================
        // GET: api/emails/sent
        // =============================================
        [HttpGet("sent")]
        public async Task<ActionResult<IEnumerable<SentEmailDto>>> GetSentEmails([FromQuery] int? contactId)
        {
            var query = _context.SentEmails
                .Include(e => e.Tracking)
                .Include(e => e.Template)
                .Include(e => e.Attachments)
                .AsQueryable();

            if (contactId.HasValue)
            {
                query = query.Where(e => e.ContactId == contactId.Value);
            }

            var emails = await query
                .OrderByDescending(e => e.SentAt)
                .Select(e => new SentEmailDto
                {
                    Id = e.Id,
                    To = e.To,
                    Cc = e.Cc,
                    Bcc = e.Bcc,
                    Subject = e.Subject,
                    Status = e.Status,
                    SentAt = e.SentAt,
                    ContactId = e.ContactId,
                    TemplateId = e.TemplateId,
                    TemplateName = e.Template != null ? e.Template.Name : null,
                    HasAttachments = e.HasAttachments,
                    AttachmentCount = e.Attachments != null ? e.Attachments.Count : 0,
                    OpenCount = e.Tracking != null ? e.Tracking.OpenCount : 0,
                    ClickCount = e.Tracking != null ? e.Tracking.ClickCount : 0,
                    RequestedReadReceipt = e.RequestReadReceipt,
                    ReadReceiptReceived = e.ReadReceiptReceived
                })
                .ToListAsync();

            return Ok(emails);
        }

        // =============================================
        // POST: api/emails/attachments/upload
        // =============================================
        [HttpPost("attachments/upload")]
        [RequestSizeLimit(10_000_000)] // 10MB limit
        public async Task<ActionResult<EmailAttachmentDto>> UploadAttachment(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            if (file.Length > 10_000_000) // 10MB
                return BadRequest("File size exceeds 10MB limit");

            try
            {
                // Create uploads directory
                var uploadsDir = Path.Combine(_env.ContentRootPath, "Uploads", "EmailAttachments");
                Directory.CreateDirectory(uploadsDir);

                // Generate unique filename
                var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                var filePath = Path.Combine(uploadsDir, uniqueFileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Create attachment record
                var attachment = new EmailAttachment
                {
                    FileName = file.FileName,
                    ContentType = file.ContentType,
                    FileSize = file.Length,
                    StoragePath = filePath,
                    StorageType = "Local",
                    UploadedAt = DateTime.UtcNow
                };

                _context.EmailAttachments.Add(attachment);
                await _context.SaveChangesAsync();

                return Ok(new EmailAttachmentDto
                {
                    Id = attachment.Id,
                    FileName = attachment.FileName,
                    ContentType = attachment.ContentType,
                    FileSize = attachment.FileSize,
                    UploadedAt = attachment.UploadedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to upload attachment", details = ex.Message });
            }
        }

        // =============================================
        // DELETE: api/emails/attachments/{id}
        // =============================================
        [HttpDelete("attachments/{id}")]
        public async Task<IActionResult> DeleteAttachment(int id)
        {
            var attachment = await _context.EmailAttachments.FindAsync(id);
            if (attachment == null) return NotFound();

            // Delete file from disk
            if (!string.IsNullOrWhiteSpace(attachment.StoragePath) && System.IO.File.Exists(attachment.StoragePath))
            {
                System.IO.File.Delete(attachment.StoragePath);
            }

            _context.EmailAttachments.Remove(attachment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // =============================================
        // GET: api/emails/scheduled
        // =============================================
        [HttpGet("scheduled")]
        public async Task<ActionResult<IEnumerable<ScheduledEmailDto>>> GetScheduledEmails()
        {
            var emails = await _context.ScheduledEmails
                .Where(e => e.Status == "Pending")
                .OrderBy(e => e.ScheduledFor)
                .Select(e => new ScheduledEmailDto
                {
                    Id = e.Id,
                    To = e.To,
                    Subject = e.Subject,
                    ScheduledFor = e.ScheduledFor,
                    CreatedAt = e.CreatedAt,
                    Status = e.Status,
                    ContactId = e.ContactId,
                    Timezone = e.Timezone
                })
                .ToListAsync();

            return Ok(emails);
        }

        // =============================================
        // DELETE: api/emails/scheduled/{id}
        // =============================================
        [HttpDelete("scheduled/{id}")]
        public async Task<IActionResult> CancelScheduledEmail(int id)
        {
            var email = await _context.ScheduledEmails.FindAsync(id);
            if (email == null) return NotFound();

            if (email.Status != "Pending")
                return BadRequest("Cannot cancel email that has already been processed");

            email.Status = "Cancelled";
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // =============================================
        // POST: api/emails/readreceipt
        // =============================================
        [AllowAnonymous]
        [HttpPost("readreceipt/{emailId}")]
        public async Task<IActionResult> RecordReadReceipt(int emailId)
        {
            var email = await _context.SentEmails.FindAsync(emailId);
            if (email == null) return NotFound();

            if (!email.ReadReceiptReceived)
            {
                email.ReadReceiptReceived = true;
                email.ReadReceiptAt = DateTime.UtcNow;
                email.Status = "Opened";
                await _context.SaveChangesAsync();
            }

            return Ok();
        }

        // =============================================
        // GET: api/emails/stats
        // =============================================
        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetEmailStats()
        {
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

            var sentEmails = await _context.SentEmails
                .Where(e => e.SentAt >= thirtyDaysAgo)
                .Include(e => e.Tracking)
                .ToListAsync();

            var scheduledCount = await _context.ScheduledEmails
                .CountAsync(e => e.Status == "Pending");

            return Ok(new
            {
                TotalSent = sentEmails.Count,
                TotalOpened = sentEmails.Count(e => e.Tracking?.OpenCount > 0),
                TotalClicked = sentEmails.Count(e => e.Tracking?.ClickCount > 0),
                TotalBounced = sentEmails.Count(e => e.Status == "Bounced"),
                TotalFailed = sentEmails.Count(e => e.Status == "Failed"),
                ScheduledPending = scheduledCount,
                OpenRate = sentEmails.Any() 
                    ? (double)sentEmails.Count(e => e.Tracking?.OpenCount > 0) / sentEmails.Count * 100 
                    : 0,
                ClickRate = sentEmails.Any() 
                    ? (double)sentEmails.Count(e => e.Tracking?.ClickCount > 0) / sentEmails.Count * 100 
                    : 0,
                ReadReceiptsReceived = sentEmails.Count(e => e.ReadReceiptReceived),
                WithAttachments = sentEmails.Count(e => e.HasAttachments)
            });
        }
        
        // =============================================
        // Helper Methods
        // =============================================
        private string ReplacePlaceholders(string text, Dictionary<string, string>? placeholders)
        {
            if (string.IsNullOrEmpty(text) || placeholders == null) return text;

            foreach (var placeholder in placeholders)
            {
                text = text.Replace($"{{{{{placeholder.Key}}}}}", placeholder.Value);
            }
            return text;
        }
    }
}
