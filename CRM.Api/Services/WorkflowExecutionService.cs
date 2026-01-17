using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;
using CRM.Api.Services.Email;
using System.Text.Json;
using System.Reflection;

namespace CRM.Api.Services
{
    /// <summary>
    /// Service to execute workflow rules when triggered
    /// </summary>
    public class WorkflowExecutionService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<WorkflowExecutionService> _logger;
        private readonly IServiceProvider _serviceProvider; // Use ServiceProvider to resolve scoped services if needed dynamically
        private readonly HttpClient _httpClient;

        public WorkflowExecutionService(
            ApplicationDbContext context, 
            ILogger<WorkflowExecutionService> logger,
            IServiceProvider serviceProvider)
        {
            _context = context;
            _logger = logger;
            _serviceProvider = serviceProvider;
            _httpClient = new HttpClient();
        }

        /// <summary>
        /// Trigger workflows when an entity is created
        /// </summary>
        public async Task TriggerOnCreate(string entityType, int entityId, object entityData)
        {
            await ExecuteMatchingWorkflows(
                WorkflowTriggerTypes.OnRecordCreate, 
                entityType, 
                entityId, 
                entityData
            );
        }

        /// <summary>
        /// Trigger workflows when an entity is updated
        /// </summary>
        public async Task TriggerOnUpdate(string entityType, int entityId, object entityData)
        {
            await ExecuteMatchingWorkflows(
                WorkflowTriggerTypes.OnRecordUpdate, 
                entityType, 
                entityId, 
                entityData
            );
        }

        private async Task ExecuteMatchingWorkflows(string triggerType, string entityType, int entityId, object entityData)
        {
            try
            {
                // Get all active workflows matching this trigger
                var workflows = await _context.WorkflowRules
                    .Where(w => w.IsActive 
                        && w.TriggerType == triggerType 
                        && w.EntityType == entityType)
                    .OrderBy(w => w.Priority)
                    .ToListAsync();

                _logger.LogInformation(
                    "Found {Count} workflows for {TriggerType} on {EntityType} #{EntityId}",
                    workflows.Count, triggerType, entityType, entityId);

                foreach (var workflow in workflows)
                {
                    await ExecuteWorkflow(workflow, entityId, entityData);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing workflows for {EntityType} #{EntityId}", entityType, entityId);
            }
        }

        private async Task ExecuteWorkflow(WorkflowRule workflow, int entityId, object entityData)
        {
            var log = new WorkflowExecutionLog
            {
                WorkflowRuleId = workflow.Id,
                Status = "Running",
                EntityId = entityId,
                EntityType = workflow.EntityType,
                StartedAt = DateTime.UtcNow,
                InputData = JsonSerializer.Serialize(entityData)
            };

            _context.WorkflowExecutionLogs.Add(log);
            await _context.SaveChangesAsync();

            try
            {
                _logger.LogInformation("Executing workflow '{Name}' (ID: {Id}) - Action: {Action}", 
                    workflow.Name, workflow.Id, workflow.ActionType);

                // Check for Delay
                if (workflow.DelayMinutes > 0)
                {
                    // In a real production system, we would queue this job (e.g., via Hangfire or BackgroundService)
                    // For this MVP, we'll log it as a limitation or use a simple delay if short (not recommended for long delays)
                    _logger.LogWarning("Workflow delay of {Minutes} mins requested but delayed execution is not fully implemented yet. Executing immediately.", workflow.DelayMinutes);
                }

                // Execute the action
                var result = await ExecuteAction(workflow, entityId, entityData);

                // Update log
                log.Status = "Success";
                log.CompletedAt = DateTime.UtcNow;
                log.OutputData = JsonSerializer.Serialize(result);

                // Update workflow stats
                workflow.ExecutionCount++;
                workflow.SuccessCount++;
                workflow.LastExecutedAt = DateTime.UtcNow;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Workflow '{Name}' failed", workflow.Name);

                log.Status = "Failed";
                log.CompletedAt = DateTime.UtcNow;
                log.ErrorMessage = ex.Message;

                workflow.ExecutionCount++;
                workflow.FailureCount++;
                workflow.LastExecutedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        private async Task<object> ExecuteAction(WorkflowRule workflow, int entityId, object entityData)
        {
            switch (workflow.ActionType)
            {
                case WorkflowActionTypes.CreateActivity:
                    return await CreateActivity(workflow, entityId, entityData);

                case WorkflowActionTypes.CreateTask:
                    return await CreateTask(workflow, entityId, entityData);

                case WorkflowActionTypes.SendNotification:
                    return await SendNotification(workflow, entityId, entityData);

                case WorkflowActionTypes.UpdateField:
                    return await UpdateField(workflow, entityId);

                case WorkflowActionTypes.SendEmail:
                    return await SendEmail(workflow, entityId, entityData);

                case WorkflowActionTypes.Webhook:
                    return await SendWebhook(workflow, entityId, entityData);

                default:
                    throw new NotSupportedException($"Action type '{workflow.ActionType}' is not supported");
            }
        }

        private async Task<object> CreateActivity(WorkflowRule workflow, int entityId, object entityData)
        {
            var parameters = ParseParameters(workflow.ActionParameters);
            
            var activity = new Activity
            {
                Type = parameters.GetValueOrDefault("type", "Workflow"),
                Subject = parameters.GetValueOrDefault("subject", $"Auto-created from workflow: {workflow.Name}"),
                Notes = parameters.GetValueOrDefault("description", $"This activity was automatically created by the workflow '{workflow.Name}' when a {workflow.EntityType} was created/updated."),
                IsCompleted = true,
                Priority = "Normal",
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow.AddMinutes(15),
                CompletedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                LastModifiedAt = DateTime.UtcNow
            };

            // Link to the entity based on type
            switch (workflow.EntityType)
            {
                case "Contact":
                    activity.ContactId = entityId;
                    break;
                case "Company":
                    activity.CompanyId = entityId;
                    break;
                case "Opportunity":
                    activity.OpportunityId = entityId;
                    break;
                case "Quote":
                    // Quotes don't have direct activity link, but we can add notes
                    activity.Subject = $"Quote #{entityId} created";
                    break;
            }

            _context.Activities.Add(activity);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created activity #{Id} from workflow", activity.Id);

            return new { activityId = activity.Id, subject = activity.Subject };
        }

        private async Task<object> CreateTask(WorkflowRule workflow, int entityId, object entityData)
        {
            var parameters = ParseParameters(workflow.ActionParameters);
            
            // Use Activity with Type="Task" since TaskItem entity doesn't exist
            var task = new Activity
            {
                Type = "Task",
                Subject = parameters.GetValueOrDefault("title", $"Follow-up: {workflow.Name}"),
                Notes = parameters.GetValueOrDefault("description", $"Auto-created task from workflow '{workflow.Name}'"),
                IsCompleted = false,
                Priority = parameters.GetValueOrDefault("priority", "Medium"),
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow.AddDays(int.Parse(parameters.GetValueOrDefault("dueDays", "1"))),
                CreatedAt = DateTime.UtcNow,
                LastModifiedAt = DateTime.UtcNow
            };

            // Link to the entity
            switch (workflow.EntityType)
            {
                case "Contact":
                    task.ContactId = entityId;
                    break;
                case "Company":
                    task.CompanyId = entityId;
                    break;
                case "Opportunity":
                    task.OpportunityId = entityId;
                    break;
            }

            _context.Activities.Add(task);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created task (activity) #{Id} from workflow", task.Id);

            return new { taskId = task.Id, title = task.Subject };
        }

        private async Task<object> SendNotification(WorkflowRule workflow, int entityId, object entityData)
        {
            var parameters = ParseParameters(workflow.ActionParameters);
            
            // For now, just log the notification
            var message = parameters.GetValueOrDefault("message", $"Workflow triggered: {workflow.Name}");
            
            _logger.LogInformation("Notification: {Message} for {EntityType} #{EntityId}", 
                message, workflow.EntityType, entityId);

            return new { notified = true, message };
        }

        private async Task<object> UpdateField(WorkflowRule workflow, int entityId)
        {
            var parameters = ParseParameters(workflow.ActionParameters);
            var fieldName = parameters.GetValueOrDefault("field", "");
            var fieldValue = parameters.GetValueOrDefault("value", "");

            if (string.IsNullOrEmpty(fieldName))
                throw new ArgumentException("Field name is required for UpdateField action");

            object entity = null;

            // Fetch entity
            switch (workflow.EntityType)
            {
                case "Contact":
                    entity = await _context.Contacts.FindAsync(entityId);
                    break;
                case "Company":
                    entity = await _context.Companies.FindAsync(entityId);
                    break;
                case "Opportunity":
                    entity = await _context.Opportunities.FindAsync(entityId);
                    break;
                case "Quote":
                    entity = await _context.Quotes.FindAsync(entityId);
                    break;
                case "Activity":
                    entity = await _context.Activities.FindAsync(entityId);
                    break;
            }

            if (entity == null)
            {
                throw new Exception($"Entity {workflow.EntityType} #{entityId} not found");
            }

            // Use Reflection to set property
            var type = entity.GetType();
            var prop = type.GetProperty(fieldName, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);

            if (prop == null)
            {
                throw new Exception($"Property '{fieldName}' not found on {workflow.EntityType}");
            }

            if (!prop.CanWrite)
            {
                throw new Exception($"Property '{fieldName}' is read-only");
            }

            // Convert value to target type
            try
            {
                object safeValue = null;
                var targetType = Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType;

                if (targetType.IsEnum)
                {
                    safeValue = Enum.Parse(targetType, fieldValue);
                }
                else
                {
                    safeValue = Convert.ChangeType(fieldValue, targetType);
                }

                prop.SetValue(entity, safeValue);
                _logger.LogInformation("Updated {EntityType} #{Id} field {Field} to {Value}", workflow.EntityType, entityId, fieldName, fieldValue);
                
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to set property '{fieldName}' to '{fieldValue}': {ex.Message}");
            }

            return new { updated = true, field = fieldName, value = fieldValue };
        }

        private async Task<object> SendEmail(WorkflowRule workflow, int entityId, object entityData)
        {
            var parameters = ParseParameters(workflow.ActionParameters);
            var toRaw = parameters.GetValueOrDefault("to", "");
            var subject = parameters.GetValueOrDefault("subject", $"Notification from Workflow: {workflow.Name}");
            var body = parameters.GetValueOrDefault("body", "This is an automated email.");
            
            // Resolve IEmailService
            using var scope = _serviceProvider.CreateScope();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

            // Determine recipient email dynamically
            string toEmail = "";
            if (toRaw.Contains("@"))
            {
                toEmail = toRaw;
            }
            else if (toRaw.StartsWith("{") && toRaw.EndsWith("}"))
            {
                // Simple token replacement logic (e.g. {Contact.Email})
                // Since 'entityData' is passed as object/anonymous, we'd need to parse it properly
                // For MVP, we'll try to guess based on entity type if "to" is missing
                
                // TODO: Implement proper token replacement
                // For now, if toRaw is placeholders, we try to extract from entity
                if (workflow.EntityType == "Contact")
                {
                    var contact = await _context.Contacts.FindAsync(entityId);
                    toEmail = contact?.Email ?? "";
                }
            }

            if (string.IsNullOrEmpty(toEmail) && workflow.EntityType == "Contact")
            {
                 // Default to contact's email if Contact workflow
                 var contact = await _context.Contacts.FindAsync(entityId);
                 toEmail = contact?.Email ?? "";
            }

            if (string.IsNullOrEmpty(toEmail))
            {
                throw new Exception("Could not determine recipient email address");
            }

            await emailService.SendEmailAsync(toEmail, subject, body, true);
            
            return new { sent = true, to = toEmail };
        }

        private async Task<object> SendWebhook(WorkflowRule workflow, int entityId, object entityData)
        {
             var parameters = ParseParameters(workflow.ActionParameters);
             var url = parameters.GetValueOrDefault("url", "");
             var method = parameters.GetValueOrDefault("method", "POST");

             if (string.IsNullOrEmpty(url))
                 throw new ArgumentException("Webhook URL is required");

             var payload = new
             {
                 workflowId = workflow.Id,
                 workflowName = workflow.Name,
                 entityType = workflow.EntityType,
                 entityId = entityId,
                 data = entityData,
                 timestamp = DateTime.UtcNow
             };

             var json = JsonSerializer.Serialize(payload);
             var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

             HttpResponseMessage response;
             if (method.ToUpper() == "POST")
             {
                 response = await _httpClient.PostAsync(url, content);
             }
             else
             {
                 // Default to POST for simplicity in MVP
                 response = await _httpClient.PostAsync(url, content);
             }

             if (!response.IsSuccessStatusCode)
             {
                 throw new Exception($"Webhook failed with status {response.StatusCode}");
             }

             return new { success = true, url, status = response.StatusCode };
        }

        private Dictionary<string, string> ParseParameters(string? json)
        {
            if (string.IsNullOrWhiteSpace(json))
                return new Dictionary<string, string>();

            try
            {
                return JsonSerializer.Deserialize<Dictionary<string, string>>(json) 
                    ?? new Dictionary<string, string>();
            }
            catch
            {
                return new Dictionary<string, string>();
            }
        }
    }
}

