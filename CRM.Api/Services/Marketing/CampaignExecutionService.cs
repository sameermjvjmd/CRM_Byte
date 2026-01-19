using System;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models.Marketing;
using CRM.Api.Services.Email;

namespace CRM.Api.Services.Marketing
{
    public interface ICampaignExecutionService
    {
        Task ProcessActiveCampaignsAsync();
        Task<bool> StartCampaignAsync(int campaignId);
    }

    public class CampaignExecutionService : ICampaignExecutionService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CampaignExecutionService> _logger;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public CampaignExecutionService(
            ApplicationDbContext context,
            ILogger<CampaignExecutionService> logger,
            IEmailService emailService,
            IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _emailService = emailService;
            _configuration = configuration;
        }

        public async Task ProcessActiveCampaignsAsync()
        {
            try
            {
                // 1. Find scheduled campaigns that need to start
                await StartScheduledCampaigns();

                // 2. Process drip campaigns steps
                await ProcessDripSteps();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing campaigns");
            }
        }

        public async Task<bool> StartCampaignAsync(int campaignId)
        {
            var campaign = await _context.MarketingCampaigns.FindAsync(campaignId);
            if (campaign == null) return false;

            _logger.LogInformation("Manually starting campaign {CampaignId}", campaign.Id);
            
            campaign.Status = CampaignStatuses.Active;
            campaign.StartedAt = DateTime.UtcNow;
            
            if (campaign.Type == CampaignTypes.Drip)
            {
                await InitializeDripRecipients(campaign);
            }
            else
            {
                await InitializeStandardRecipients(campaign);
                // For standard campaigns, we might want to trigger the first batch immediately
                // but for now the background service or a separate queue will handle "Active" standard campaigns
            }

            await _context.SaveChangesAsync();
            return true;
        }

        private async Task StartScheduledCampaigns()
        {
            var now = DateTime.UtcNow;
            var campaignsToStart = await _context.MarketingCampaigns
                .Where(c => c.Status == CampaignStatuses.Scheduled && c.ScheduledFor <= now)
                .ToListAsync();

            foreach (var campaign in campaignsToStart)
            {
                _logger.LogInformation("Starting scheduled campaign {CampaignId}", campaign.Id);
                
                campaign.Status = CampaignStatuses.Active;
                campaign.StartedAt = now;
                
                if (campaign.Type == CampaignTypes.Drip)
                {
                    // For Drip, we initialize recipients at Step 1
                    await InitializeDripRecipients(campaign);
                }
                else
                {
                    // For standard email blast, we queue sending immediately (or add to a send queue)
                    // Simplified: We'll assume a separate "Sender" service handles "Active" campaigns
                    // But for this MVP, let's just create the recipients and mark them pending
                    await InitializeStandardRecipients(campaign);
                }
            }

            if (campaignsToStart.Any())
            {
                await _context.SaveChangesAsync();
            }
        }

        private async Task InitializeStandardRecipients(MarketingCampaign campaign)
        {
             if (campaign.MarketingListId == null) return;

            var members = await _context.MarketingListMembers
                .Where(m => m.MarketingListId == campaign.MarketingListId 
                       && m.Status == ListMemberStatuses.Subscribed)
                .ToListAsync();

            foreach (var member in members)
            {
                // Check suppression
                bool supposed = await _context.SuppressionEntries.AnyAsync(s => s.Email == member.Email);
                if (supposed) continue;

                _context.CampaignRecipients.Add(new CampaignRecipient
                {
                    CampaignId = campaign.Id,
                    ContactId = member.ContactId,
                    MarketingListMemberId = member.Id,
                    Email = member.Email,
                    Status = "Pending",
                    // No steps for standard campaign
                });
            }
        }

        private async Task InitializeDripRecipients(MarketingCampaign campaign)
        {
            if (campaign.MarketingListId == null) return;

            // Get first step
            var firstStep = await _context.CampaignSteps
                .Where(s => s.CampaignId == campaign.Id)
                .OrderBy(s => s.OrderIndex)
                .FirstOrDefaultAsync();

            if (firstStep == null)
            {
                _logger.LogWarning("Drip campaign {CampaignId} has no steps.", campaign.Id);
                return;
            }

            var members = await _context.MarketingListMembers
                .Where(m => m.MarketingListId == campaign.MarketingListId 
                       && m.Status == ListMemberStatuses.Subscribed)
                .ToListAsync();

            foreach (var member in members)
            {
                // Check suppression
                bool supposed = await _context.SuppressionEntries.AnyAsync(s => s.Email == member.Email);
                if (supposed) continue;

                var nextRun = DateTime.UtcNow.AddMinutes(firstStep.DelayMinutes);

                _context.CampaignRecipients.Add(new CampaignRecipient
                {
                    CampaignId = campaign.Id,
                    ContactId = member.ContactId,
                    MarketingListMemberId = member.Id,
                    Email = member.Email,
                    Status = "Active", // Recipient is active in the drip
                    CurrentStepId = firstStep.Id,
                    NextStepScheduledAt = nextRun
                });
            }
        }

        private async Task ProcessDripSteps()
        {
            var now = DateTime.UtcNow;
            
            // Find recipients who are due for their next step
            // We verify campaign is still Active
            var dueRecipients = await _context.CampaignRecipients
                .Include(r => r.Campaign)
                .Include(r => r.CurrentStep)
                .Where(r => r.Campaign.Status == CampaignStatuses.Active
                         && r.Campaign.Type == CampaignTypes.Drip
                         && r.NextStepScheduledAt <= now
                         && r.CurrentStepId != null
                         && r.Status != "Completed" 
                         && r.Status != "Unsubscribed"
                         && r.Status != "Bounced")
                .Take(50) // Batch processing
                .ToListAsync();

            foreach (var recipient in dueRecipients)
            {
                await ExecuteDripStep(recipient);
            }
            
            if (dueRecipients.Any())
            {
                await _context.SaveChangesAsync();
            }
        }

        private async Task ExecuteDripStep(CampaignRecipient recipient)
        {
            if (recipient.CurrentStep == null) return;

            _logger.LogInformation("Executing Drip Step {StepName} for {Email}", recipient.CurrentStep.Name, recipient.Email);

            try
            {
                string baseUrl = _configuration["App:BaseUrl"] ?? "http://localhost:5000";
                
                // Send Email
                string subject = recipient.CurrentStep.Subject ?? "Information";
                string body = recipient.CurrentStep.HtmlContent ?? recipient.CurrentStep.PlainTextContent ?? "Content";

                // Simple template replacement
                if (recipient.ContactId.HasValue)
                {
                    var contact = await _context.Contacts.FindAsync(recipient.ContactId.Value);
                    if (contact != null)
                    {
                        body = body.Replace("{FirstName}", contact.FirstName ?? "")
                                   .Replace("{LastName}", contact.LastName ?? "");
                    }
                }
                
                // --- TRACKING INJECTION ---
                
                // 1. Link Tracking (Simple href replacement)
                // Use a simplified regex to find http/https links in href attributes
                // NOTE: This is a basic implementation; robust HTML parsing is recommended for production
                body = System.Text.RegularExpressions.Regex.Replace(body, 
                    "href=\"(http[s]?://[^\"]+)\"", 
                    m => 
                    {
                        var originalUrl = m.Groups[1].Value;
                        // Avoid tracking already tracking links or unsubscribe links if they need to be excluded
                        if (originalUrl.Contains("/api/tracking")) return m.Value;
                        
                        var encodedUrl = System.Web.HttpUtility.UrlEncode(originalUrl);
                        var trackingUrl = $"{baseUrl}/api/tracking/click/{recipient.Id}?url={encodedUrl}";
                        return $"href=\"{trackingUrl}\"";
                    }, 
                    System.Text.RegularExpressions.RegexOptions.IgnoreCase);

                // 2. Open Tracking Pixel
                var pixelUrl = $"{baseUrl}/api/tracking/open/{recipient.Id}";
                var trackingPixel = $"<img src=\"{pixelUrl}\" width=\"1\" height=\"1\" style=\"display:none;\" alt=\"\" />";
                
                // Append pixel to the end of the body
                if (body.Contains("</body>"))
                {
                    body = body.Replace("</body>", trackingPixel + "</body>");
                }
                else
                {
                    body += trackingPixel;
                }
                
                // ---------------------------

                try 
                {
                    await _emailService.SendEmailAsync(recipient.Email, subject, body, true);
                }
                catch (Exception emailEx)
                {
                    _logger.LogWarning("Email sending failed for {Email} but proceeding with drip flow: {Msg}", recipient.Email, emailEx.Message);
                }

                // Log execution (Create a separate log table or just update last sent)
                recipient.SentAt = DateTime.UtcNow; 
                
                // Update Campaign Stats
                if (recipient.Campaign != null)
                {
                    recipient.Campaign.SentCount++;
                }

                // Move to next step
                var nextStep = await _context.CampaignSteps
                    .Where(s => s.CampaignId == recipient.CampaignId && s.OrderIndex > recipient.CurrentStep.OrderIndex)
                    .OrderBy(s => s.OrderIndex)
                    .FirstOrDefaultAsync();

                if (nextStep != null)
                {
                    recipient.CurrentStepId = nextStep.Id;
                    recipient.CurrentStep = nextStep; // EF tracking
                    recipient.NextStepScheduledAt = DateTime.UtcNow.AddMinutes(nextStep.DelayMinutes);
                }
                else
                {
                    // End of drip
                    recipient.Status = "Completed";
                    recipient.NextStepScheduledAt = null;
                    recipient.CurrentStepId = null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to execute drip step for {Email}", recipient.Email);
                // Retry logic could go here
            }
        }
    }
}
