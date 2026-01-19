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
        public async Task<IActionResult> TrackOpen(int recipientId, [FromQuery] int? stepId)
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
                        recipient.Status = isFirstOpen && recipient.Status != "Clicked" ? "Opened" : recipient.Status;
                        
                        if (recipient.Campaign != null)
                        {
                            recipient.Campaign.OpenCount++;
                            recipient.Campaign.UniqueOpenCount++;
                        }
                        
                        if (recipient.ContactId.HasValue)
                        {
                            await _leadScoringService.EvaluateRulesAsync("EmailOpen", recipient.ContactId.Value, new { CampaignId = recipient.CampaignId, StepId = stepId });
                        }
                    }
                    else 
                    {
                        if (recipient.Campaign != null)
                            recipient.Campaign.OpenCount++;
                    }

                    // Step specific stats
                    if (stepId.HasValue)
                    {
                        var step = await _context.CampaignSteps.FindAsync(stepId.Value);
                        if (step != null)
                        {
                            step.OpenCount++;
                        }
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
        public async Task<IActionResult> TrackClick(int recipientId, [FromQuery] string url, [FromQuery] int? stepId)
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
                    
                    if (isFirstClick)
                    {
                        recipient.FirstClickedAt = DateTime.UtcNow;
                        recipient.Status = "Clicked";
                        
                        if (recipient.Campaign != null)
                        {
                            recipient.Campaign.UniqueClickCount++;
                        }

                        if (recipient.ContactId.HasValue)
                        {
                            await _leadScoringService.EvaluateRulesAsync("EmailClick", recipient.ContactId.Value, new { CampaignId = recipient.CampaignId, StepId = stepId, Url = url });
                        }
                    }

                    if (recipient.Campaign != null)
                    {
                        recipient.Campaign.ClickCount++;
                    }

                    // Step specific stats
                    if (stepId.HasValue)
                    {
                        var step = await _context.CampaignSteps.FindAsync(stepId.Value);
                        if (step != null)
                        {
                            step.ClickCount++;
                        }
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
