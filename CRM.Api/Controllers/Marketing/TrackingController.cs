using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Services.Marketing;

namespace CRM.Api.Controllers.Marketing
{
    [ApiController]
    [Route("api/tracking")]
    public class TrackingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILeadScoringService _leadScoringService;
        private readonly ILogger<TrackingController> _logger;

        // 1x1 transparent GIF pixel
        private readonly byte[] _pixel = Convert.FromBase64String("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");

        public TrackingController(
            ApplicationDbContext context,
            ILeadScoringService leadScoringService,
            ILogger<TrackingController> logger)
        {
            _context = context;
            _leadScoringService = leadScoringService;
            _logger = logger;
        }

        [HttpGet("open/{recipientId}")]
        public async Task<IActionResult> TrackOpen(int recipientId)
        {
            try
            {
                var recipient = await _context.CampaignRecipients
                    .Include(r => r.Campaign)
                    .FirstOrDefaultAsync(r => r.Id == recipientId);

                if (recipient != null)
                {
                    bool isFirstOpen = recipient.OpenCount == 0;
                    
                    recipient.OpenCount++;
                    recipient.LastOpenedAt = DateTime.UtcNow;
                    
                    if (isFirstOpen)
                    {
                        recipient.FirstOpenedAt = DateTime.UtcNow;
                        recipient.Status = "Opened";
                        
                        // Update Campaign Stats
                        if (recipient.Campaign != null)
                        {
                            recipient.Campaign.OpenCount++;
                            recipient.Campaign.UniqueOpenCount++;
                        }
                        
                        // Trigger Lead Scoring
                        if (recipient.ContactId.HasValue)
                        {
                            await _leadScoringService.EvaluateRulesAsync("EmailOpen", recipient.ContactId.Value, new { CampaignId = recipient.CampaignId });
                        }
                    }
                    else 
                    {
                        if (recipient.Campaign != null)
                            recipient.Campaign.OpenCount++;
                    }

                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error tracking email open for recipient {Id}", recipientId);
            }

            return File(_pixel, "image/gif");
        }

        [HttpGet("click/{recipientId}")]
        public async Task<IActionResult> TrackClick(int recipientId, [FromQuery] string url)
        {
            if (string.IsNullOrEmpty(url)) return BadRequest("URL is required");

            try
            {
                var recipient = await _context.CampaignRecipients
                    .Include(r => r.Campaign)
                    .FirstOrDefaultAsync(r => r.Id == recipientId);

                if (recipient != null)
                {
                    bool isFirstClick = recipient.ClickCount == 0;

                    recipient.ClickCount++;
                    recipient.LastClickedAt = DateTime.UtcNow;
                    
                    // Track unique clicks
                    if (isFirstClick)
                    {
                        recipient.FirstClickedAt = DateTime.UtcNow;
                        recipient.Status = "Clicked"; // Upgrade status from Opened to Clicked if applicable
                        
                        if (recipient.Campaign != null)
                        {
                            recipient.Campaign.UniqueClickCount++;
                        }

                        // Trigger Lead Scoring
                        if (recipient.ContactId.HasValue)
                        {
                            await _leadScoringService.EvaluateRulesAsync("EmailClick", recipient.ContactId.Value, new { CampaignId = recipient.CampaignId, Url = url });
                        }
                    }

                    if (recipient.Campaign != null)
                    {
                        recipient.Campaign.ClickCount++;
                    }

                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error tracking email click for recipient {Id}", recipientId);
            }

            return Redirect(url);
        }
    }
}
