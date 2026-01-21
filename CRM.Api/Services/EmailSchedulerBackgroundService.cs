using CRM.Api.Data;
using CRM.Api.Models.Email;
using CRM.Api.Services.Email;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace CRM.Api.Services
{
    /// <summary>
    /// Background service to process scheduled emails
    /// Runs every minute to check for emails that need to be sent
    /// </summary>
    public class EmailSchedulerBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<EmailSchedulerBackgroundService> _logger;
        private readonly TimeSpan _interval = TimeSpan.FromMinutes(1); // Check every minute

        public EmailSchedulerBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<EmailSchedulerBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Email Scheduler Background Service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessScheduledEmails();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing scheduled emails");
                }

                // Wait for next interval
                await Task.Delay(_interval, stoppingToken);
            }

            _logger.LogInformation("Email Scheduler Background Service stopped");
        }

        private async Task ProcessScheduledEmails()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

            // Get all pending scheduled emails that are due
            var dueEmails = await context.ScheduledEmails
                .Where(e => e.Status == "Pending" && e.ScheduledFor <= DateTime.UtcNow)
                .OrderBy(e => e.ScheduledFor)
                .Take(50) // Process max 50 at a time
                .ToListAsync();

            if (dueEmails.Count == 0)
            {
                return; // Nothing to process
            }

            _logger.LogInformation("Processing {Count} scheduled emails", dueEmails.Count);

            foreach (var scheduledEmail in dueEmails)
            {
                try
                {
                    // Mark as processing
                    scheduledEmail.Status = "Sending";
                    await context.SaveChangesAsync();

                    // Parse attachments if any
                    var attachmentPaths = new List<string>();
                    if (!string.IsNullOrEmpty(scheduledEmail.AttachmentsJson))
                    {
                        try
                        {
                            var attachmentIds = JsonSerializer.Deserialize<List<int>>(scheduledEmail.AttachmentsJson);
                            if (attachmentIds?.Any() == true)
                            {
                                var attachments = await context.EmailAttachments
                                    .Where(a => attachmentIds.Contains(a.Id))
                                    .ToListAsync();
                                attachmentPaths = attachments
                                    .Where(a => !string.IsNullOrWhiteSpace(a.StoragePath))
                                    .Select(a => a.StoragePath!)
                                    .ToList();
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to parse attachments for scheduled email {Id}", scheduledEmail.Id);
                        }
                    }

                    // Send the email
                    await emailService.SendEmailAsync(
                        scheduledEmail.To,
                        scheduledEmail.Subject,
                        scheduledEmail.Body,
                        isHtml: true,
                        cc: scheduledEmail.Cc,
                        bcc: scheduledEmail.Bcc,
                        attachments: attachmentPaths
                    );

                    // Record in SentEmails
                    var sentEmail = new SentEmail
                    {
                        To = scheduledEmail.To,
                        Cc = scheduledEmail.Cc,
                        Bcc = scheduledEmail.Bcc,
                        Subject = scheduledEmail.Subject,
                        Body = scheduledEmail.Body,
                        SentAt = DateTime.UtcNow,
                        CreatedAt = scheduledEmail.CreatedAt,
                        SentByUserId = scheduledEmail.CreatedByUserId,
                        Status = "Sent",
                        ContactId = scheduledEmail.ContactId,
                        TemplateId = scheduledEmail.TemplateId,
                        HasAttachments = attachmentPaths.Any(),
                        AttachmentsJson = attachmentPaths.Any()
                            ? JsonSerializer.Serialize(attachmentPaths.Select(Path.GetFileName))
                            : null,
                        RequestReadReceipt = scheduledEmail.RequestReadReceipt,
                        IsScheduled = true,
                        ScheduledFor = scheduledEmail.ScheduledFor,
                        ScheduleSent = true,
                        Tracking = new EmailTracking()
                    };

                    await emailService.RecordSentEmailAsync(sentEmail);

                    // Link attachments to sent email
                    if (!string.IsNullOrEmpty(scheduledEmail.AttachmentsJson))
                    {
                        try
                        {
                            var attachmentIds = JsonSerializer.Deserialize<List<int>>(scheduledEmail.AttachmentsJson);
                            if (attachmentIds?.Any() == true)
                            {
                                var attachments = await context.EmailAttachments
                                    .Where(a => attachmentIds.Contains(a.Id))
                                    .ToListAsync();
                                foreach (var att in attachments)
                                {
                                    // Create a copy link for the sent email
                                    var newAtt = new EmailAttachment
                                    {
                                        FileName = att.FileName,
                                        ContentType = att.ContentType,
                                        FileSize = att.FileSize,
                                        StoragePath = att.StoragePath,
                                        StorageType = att.StorageType,
                                        SentEmailId = sentEmail.Id,
                                        UploadedAt = DateTime.UtcNow
                                    };
                                    context.EmailAttachments.Add(newAtt);
                                }
                                await context.SaveChangesAsync();
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to link attachments for scheduled email {Id}", scheduledEmail.Id);
                        }
                    }

                    // Mark scheduled email as sent
                    scheduledEmail.Status = "Sent";
                    scheduledEmail.ProcessedAt = DateTime.UtcNow;
                    await context.SaveChangesAsync();

                    _logger.LogInformation("Successfully sent scheduled email {Id} to {To}", scheduledEmail.Id, scheduledEmail.To);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send scheduled email {Id}", scheduledEmail.Id);

                    // Mark as failed
                    scheduledEmail.Status = "Failed";
                    scheduledEmail.ProcessedAt = DateTime.UtcNow;
                    scheduledEmail.ErrorMessage = ex.Message;
                    await context.SaveChangesAsync();
                }
            }

            _logger.LogInformation("Finished processing {Count} scheduled emails", dueEmails.Count);
        }
    }
}
