using System;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;

namespace CRM.Api.Services
{
    public class WorkflowBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<WorkflowBackgroundService> _logger;

        public WorkflowBackgroundService(IServiceProvider serviceProvider, ILogger<WorkflowBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Workflow Background Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessPendingWorkflows();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing pending workflows.");
                }

                // Poll every minute
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }

        private async Task ProcessPendingWorkflows()
        {
            _logger.LogDebug("Processing pending workflows and campaigns...");
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var workflowService = scope.ServiceProvider.GetRequiredService<WorkflowExecutionService>();
                var campaignService = scope.ServiceProvider.GetRequiredService<CRM.Api.Services.Marketing.ICampaignExecutionService>();
                var listService = scope.ServiceProvider.GetRequiredService<CRM.Api.Services.Marketing.IDynamicListService>();

                // 1. Process Delayed Workflows
                var now = DateTime.UtcNow;
                var pendingLogs = await context.WorkflowExecutionLogs
                    .Where(l => l.Status == "Pending" && l.ScheduledExecutionTime <= now)
                    .Select(l => l.Id)
                    .ToListAsync();

                if (pendingLogs.Any())
                {
                    _logger.LogInformation("Found {Count} pending workflows to execute.", pendingLogs.Count);

                    foreach (var logId in pendingLogs)
                    {
                        try
                        {
                            await workflowService.ExecutePendingLogAsync(logId);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Failed to execute pending workflow log #{LogId}", logId);
                        }
                    }
                }

                // 2. Process Drip Campaigns
                _logger.LogDebug("Calling ProcessActiveCampaignsAsync...");
                await campaignService.ProcessActiveCampaignsAsync();

                // 3. Process Dynamic Lists
                await listService.ProcessDynamicListsAsync();
            }
        }
    }
}
