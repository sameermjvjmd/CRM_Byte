using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using CRM.Api.Data;
using CRM.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CRM.Api.Services.Webhooks
{
    public interface IWebhookService
    {
        Task TriggerWebhookAsync(string eventType, object data);
        Task<List<Webhook>> GetActiveWebhooksAsync();
        Task<Webhook?> GetWebhookAsync(int id);
        Task<Webhook> CreateWebhookAsync(Webhook webhook);
        Task<Webhook?> UpdateWebhookAsync(int id, Webhook webhook);
        Task<bool> DeleteWebhookAsync(int id);
        Task<List<WebhookLog>> GetWebhookLogsAsync(int webhookId, int limit = 50);
    }

    public class WebhookService : IWebhookService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<WebhookService> _logger;

        public WebhookService(
            ApplicationDbContext context,
            IHttpClientFactory httpClientFactory,
            ILogger<WebhookService> logger)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        /// <summary>
        /// Trigger webhooks for a specific event type
        /// </summary>
        public async Task TriggerWebhookAsync(string eventType, object data)
        {
            try
            {
                // Get all active webhooks that subscribe to this event
                var webhooks = await _context.Webhooks
                    .Where(w => w.IsActive && w.Events.Contains(eventType))
                    .ToListAsync();

                if (!webhooks.Any())
                {
                    _logger.LogDebug($"No active webhooks found for event: {eventType}");
                    return;
                }

                _logger.LogInformation($"Triggering {webhooks.Count} webhook(s) for event: {eventType}");

                // Trigger each webhook (fire and forget with retry logic)
                foreach (var webhook in webhooks)
                {
                    _ = Task.Run(async () => await SendWebhookAsync(webhook, eventType, data));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error triggering webhooks for event: {eventType}");
            }
        }

        /// <summary>
        /// Send webhook payload to external endpoint
        /// </summary>
        private async Task SendWebhookAsync(Webhook webhook, string eventType, object data, int attemptNumber = 1)
        {
            const int maxAttempts = 3;
            var log = new WebhookLog
            {
                WebhookId = webhook.Id,
                EventType = eventType,
                AttemptNumber = attemptNumber
            };

            try
            {
                // Create payload
                var payload = new
                {
                    @event = eventType,
                    data = data,
                    timestamp = DateTime.UtcNow,
                    webhook_id = webhook.Id
                };

                var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                log.Payload = json;

                // Create HTTP request
                var httpClient = _httpClientFactory.CreateClient();
                httpClient.Timeout = TimeSpan.FromSeconds(30);

                var request = new HttpRequestMessage(HttpMethod.Post, webhook.Url)
                {
                    Content = new StringContent(json, Encoding.UTF8, "application/json")
                };

                // Add signature for security
                var signature = GenerateSignature(json, webhook.Secret);
                request.Headers.Add("X-Webhook-Signature", signature);
                request.Headers.Add("X-Webhook-Event", eventType);
                request.Headers.Add("X-Webhook-Id", webhook.Id.ToString());

                // Add custom headers if specified
                if (!string.IsNullOrEmpty(webhook.CustomHeaders))
                {
                    try
                    {
                        var headers = JsonSerializer.Deserialize<Dictionary<string, string>>(webhook.CustomHeaders);
                        if (headers != null)
                        {
                            foreach (var header in headers)
                            {
                                request.Headers.Add(header.Key, header.Value);
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, $"Failed to parse custom headers for webhook {webhook.Id}");
                    }
                }

                // Send request
                var response = await httpClient.SendAsync(request);
                log.StatusCode = (int)response.StatusCode;
                log.Response = await response.Content.ReadAsStringAsync();
                log.Success = response.IsSuccessStatusCode;

                if (response.IsSuccessStatusCode)
                {
                    // Update webhook stats
                    webhook.TriggerCount++;
                    webhook.LastTriggeredAt = DateTime.UtcNow;
                    webhook.FailureCount = 0;
                    webhook.LastError = null;

                    _logger.LogInformation($"Webhook {webhook.Id} triggered successfully for event: {eventType}");
                }
                else
                {
                    log.ErrorMessage = $"HTTP {log.StatusCode}: {log.Response}";
                    webhook.FailureCount++;
                    webhook.LastError = log.ErrorMessage;

                    _logger.LogWarning($"Webhook {webhook.Id} failed with status {log.StatusCode}");

                    // Retry if not max attempts
                    if (attemptNumber < maxAttempts)
                    {
                        var delay = TimeSpan.FromSeconds(Math.Pow(2, attemptNumber)); // Exponential backoff
                        _logger.LogInformation($"Retrying webhook {webhook.Id} in {delay.TotalSeconds}s (attempt {attemptNumber + 1}/{maxAttempts})");
                        await Task.Delay(delay);
                        await SendWebhookAsync(webhook, eventType, data, attemptNumber + 1);
                        return; // Don't save log yet, wait for final attempt
                    }
                }
            }
            catch (Exception ex)
            {
                log.Success = false;
                log.ErrorMessage = ex.Message;
                webhook.FailureCount++;
                webhook.LastError = ex.Message;

                _logger.LogError(ex, $"Exception sending webhook {webhook.Id} for event: {eventType}");

                // Retry on exception
                if (attemptNumber < maxAttempts)
                {
                    var delay = TimeSpan.FromSeconds(Math.Pow(2, attemptNumber));
                    await Task.Delay(delay);
                    await SendWebhookAsync(webhook, eventType, data, attemptNumber + 1);
                    return;
                }
            }

            // Save log and update webhook
            try
            {
                _context.WebhookLogs.Add(log);
                _context.Webhooks.Update(webhook);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to save webhook log");
            }

            // Disable webhook if too many failures
            if (webhook.FailureCount >= 10)
            {
                webhook.IsActive = false;
                _logger.LogWarning($"Webhook {webhook.Id} disabled after {webhook.FailureCount} consecutive failures");
                await _context.SaveChangesAsync();
            }
        }

        /// <summary>
        /// Generate HMAC-SHA256 signature for webhook payload
        /// </summary>
        private string GenerateSignature(string payload, string secret)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
            return Convert.ToBase64String(hash);
        }

        public async Task<List<Webhook>> GetActiveWebhooksAsync()
        {
            return await _context.Webhooks
                .Where(w => w.IsActive)
                .OrderBy(w => w.Name)
                .ToListAsync();
        }

        public async Task<Webhook?> GetWebhookAsync(int id)
        {
            return await _context.Webhooks.FindAsync(id);
        }

        public async Task<Webhook> CreateWebhookAsync(Webhook webhook)
        {
            // Generate secret if not provided
            if (string.IsNullOrEmpty(webhook.Secret))
            {
                webhook.Secret = GenerateRandomSecret();
            }

            webhook.CreatedAt = DateTime.UtcNow;
            _context.Webhooks.Add(webhook);
            await _context.SaveChangesAsync();
            return webhook;
        }

        public async Task<Webhook?> UpdateWebhookAsync(int id, Webhook webhook)
        {
            var existing = await _context.Webhooks.FindAsync(id);
            if (existing == null) return null;

            existing.Name = webhook.Name;
            existing.Url = webhook.Url;
            existing.Events = webhook.Events;
            existing.IsActive = webhook.IsActive;
            existing.Description = webhook.Description;
            existing.CustomHeaders = webhook.CustomHeaders;
            existing.UpdatedAt = DateTime.UtcNow;

            // Only update secret if provided
            if (!string.IsNullOrEmpty(webhook.Secret))
            {
                existing.Secret = webhook.Secret;
            }

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteWebhookAsync(int id)
        {
            var webhook = await _context.Webhooks.FindAsync(id);
            if (webhook == null) return false;

            _context.Webhooks.Remove(webhook);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<WebhookLog>> GetWebhookLogsAsync(int webhookId, int limit = 50)
        {
            return await _context.WebhookLogs
                .Where(l => l.WebhookId == webhookId)
                .OrderByDescending(l => l.CreatedAt)
                .Take(limit)
                .ToListAsync();
        }

        private string GenerateRandomSecret()
        {
            var bytes = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes);
        }
    }
}
