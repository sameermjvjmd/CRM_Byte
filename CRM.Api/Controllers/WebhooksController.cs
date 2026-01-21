using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CRM.Api.Models;
using CRM.Api.Services.Webhooks;

namespace CRM.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class WebhooksController : ControllerBase
    {
        private readonly IWebhookService _webhookService;
        private readonly ILogger<WebhooksController> _logger;

        public WebhooksController(
            IWebhookService webhookService,
            ILogger<WebhooksController> logger)
        {
            _webhookService = webhookService;
            _logger = logger;
        }

        /// <summary>
        /// Get all webhooks
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<Webhook>>> GetWebhooks()
        {
            var webhooks = await _webhookService.GetActiveWebhooksAsync();
            return Ok(webhooks);
        }

        /// <summary>
        /// Get webhook by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Webhook>> GetWebhook(int id)
        {
            var webhook = await _webhookService.GetWebhookAsync(id);
            if (webhook == null)
                return NotFound(new { message = "Webhook not found" });

            return Ok(webhook);
        }

        /// <summary>
        /// Create a new webhook
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Webhook>> CreateWebhook(Webhook webhook)
        {
            try
            {
                var created = await _webhookService.CreateWebhookAsync(webhook);
                return CreatedAtAction(nameof(GetWebhook), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating webhook");
                return StatusCode(500, new { message = "Failed to create webhook", details = ex.Message });
            }
        }

        /// <summary>
        /// Update an existing webhook
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<Webhook>> UpdateWebhook(int id, Webhook webhook)
        {
            try
            {
                var updated = await _webhookService.UpdateWebhookAsync(id, webhook);
                if (updated == null)
                    return NotFound(new { message = "Webhook not found" });

                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating webhook");
                return StatusCode(500, new { message = "Failed to update webhook", details = ex.Message });
            }
        }

        /// <summary>
        /// Delete a webhook
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWebhook(int id)
        {
            try
            {
                var deleted = await _webhookService.DeleteWebhookAsync(id);
                if (!deleted)
                    return NotFound(new { message = "Webhook not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting webhook");
                return StatusCode(500, new { message = "Failed to delete webhook", details = ex.Message });
            }
        }

        /// <summary>
        /// Get webhook delivery logs
        /// </summary>
        [HttpGet("{id}/logs")]
        public async Task<ActionResult<List<WebhookLog>>> GetWebhookLogs(int id, [FromQuery] int limit = 50)
        {
            try
            {
                var logs = await _webhookService.GetWebhookLogsAsync(id, limit);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting webhook logs");
                return StatusCode(500, new { message = "Failed to get webhook logs", details = ex.Message });
            }
        }

        /// <summary>
        /// Test a webhook by sending a test event
        /// </summary>
        [HttpPost("{id}/test")]
        public async Task<IActionResult> TestWebhook(int id)
        {
            try
            {
                var webhook = await _webhookService.GetWebhookAsync(id);
                if (webhook == null)
                    return NotFound(new { message = "Webhook not found" });

                // Trigger a test event
                await _webhookService.TriggerWebhookAsync("webhook.test", new
                {
                    message = "This is a test webhook event",
                    webhook_id = id,
                    timestamp = DateTime.UtcNow
                });

                return Ok(new { message = "Test webhook triggered successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing webhook");
                return StatusCode(500, new { message = "Failed to test webhook", details = ex.Message });
            }
        }

        /// <summary>
        /// Get available webhook events
        /// </summary>
        [HttpGet("events")]
        public ActionResult<List<string>> GetAvailableEvents()
        {
            var events = new List<string>
            {
                "contact.created",
                "contact.updated",
                "contact.deleted",
                "company.created",
                "company.updated",
                "company.deleted",
                "opportunity.created",
                "opportunity.updated",
                "opportunity.stage_changed",
                "opportunity.won",
                "opportunity.lost",
                "activity.created",
                "activity.completed",
                "email.sent",
                "email.opened",
                "email.clicked",
                "quote.created",
                "quote.sent",
                "quote.accepted",
                "quote.declined",
                "workflow.triggered",
                "campaign.sent",
                "webhook.test"
            };

            return Ok(events);
        }
    }
}
