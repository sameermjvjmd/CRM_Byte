using System;
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

        /// <summary>
        /// Trigger workflows when a form is submitted (e.g., landing page, contact form)
        /// </summary>
        public async Task TriggerOnFormSubmission(string formId, Dictionary<string, string> formData)
        {
            try
            {
                _logger.LogInformation("Form submission received: {FormId} with {FieldCount} fields", formId, formData.Count);

                // Get all active workflows for form submission trigger
                var workflows = await _context.WorkflowRules
                    .Where(w => w.IsActive && w.TriggerType == WorkflowTriggerTypes.OnFormSubmission)
                    .OrderBy(w => w.Priority)
                    .ToListAsync();

                _logger.LogInformation("Found {Count} workflows for form submission", workflows.Count);

                foreach (var workflow in workflows)
                {
                    // Check if workflow matches this specific form (if formId is specified in conditions)
                    if (!string.IsNullOrEmpty(workflow.TriggerConditions))
                    {
                        try
                        {
                            var conditions = JsonSerializer.Deserialize<Dictionary<string, string>>(workflow.TriggerConditions);
                            if (conditions != null && conditions.ContainsKey("formId"))
                            {
                                if (conditions["formId"] != formId)
                                {
                                    continue; // Skip this workflow, it's for a different form
                                }
                            }
                        }
                        catch
                        {
                            // If conditions parsing fails, continue anyway
                        }
                    }

                    // Execute workflow with form data
                    await ExecuteWorkflow(workflow, 0, formData);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing workflows for form submission: {FormId}", formId);
            }
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

                // If entityData is null or generic object, try to fetch the real entity
                object? targetEntity = entityData;
                if (targetEntity == null || targetEntity.GetType() == typeof(object))
                {
                   targetEntity = await FetchEntityAsync(entityType, entityId);
                }

                foreach (var workflow in workflows)
                {
                    // Check conditions
                    if (!MatchesConditions(workflow, targetEntity))
                    {
                        continue;
                    }

                    await ExecuteWorkflow(workflow, entityId, entityData ?? targetEntity ?? new object());
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing workflows for {EntityType} #{EntityId}", entityType, entityId);
            }
        }

        public async Task ExecuteWorkflow(WorkflowRule workflow, int entityId, object entityData)
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

            // Check for Delay
            if (workflow.DelayMinutes > 0)
            {
                log.Status = "Pending";
                log.ScheduledExecutionTime = DateTime.UtcNow.AddMinutes(workflow.DelayMinutes);
                _context.WorkflowExecutionLogs.Add(log);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Workflow '{Name}' scheduled for execution at {Time}", workflow.Name, log.ScheduledExecutionTime);
                return;
            }

            _context.WorkflowExecutionLogs.Add(log);
            await _context.SaveChangesAsync();

            await RunWorkflowAction(workflow, log, entityId, entityData);
        }

        public async Task ExecutePendingLogAsync(int logId)
        {
            var log = await _context.WorkflowExecutionLogs
                .Include(l => l.WorkflowRule)
                .FirstOrDefaultAsync(l => l.Id == logId);

            if (log == null || log.Status != "Pending") return;

            log.Status = "Running";
            log.StartedAt = DateTime.UtcNow; // Actual run start
            await _context.SaveChangesAsync();

            try 
            {
                // Deserialize entity data if needed, or pass null if actions re-fetch from DB
                // Most actions in RunWorkflowAction rely on fetching the entity from DB using EntityId
                // Exception: Triggers that pass transient data. For now we assume DB fetch is sufficient for actions.
                // We'll pass a basic dictionary or null as entityData since real object type is lost
                object? entityData = null;
                if (!string.IsNullOrEmpty(log.InputData))
                {
                    try { entityData = JsonSerializer.Deserialize<Dictionary<string, object>>(log.InputData); } catch {}
                }

                if (log.WorkflowRule != null)
                {
                    await RunWorkflowAction(log.WorkflowRule, log, log.EntityId ?? 0, entityData ?? new object());
                }
            }
            catch (Exception ex)
            {
                log.Status = "Failed";
                log.CompletedAt = DateTime.UtcNow;
                log.ErrorMessage = ex.Message;
                await _context.SaveChangesAsync();
            }
        }

        private async Task RunWorkflowAction(WorkflowRule workflow, WorkflowExecutionLog log, int entityId, object entityData)
        {
            try
            {
                _logger.LogInformation("Executing workflow '{Name}' (ID: {Id}) - Action: {Action}", 
                    workflow.Name, workflow.Id, workflow.ActionType);

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
        private async Task<object?> FetchEntityAsync(string entityType, int entityId)
        {
            switch (entityType)
            {
                case "Contact": return await _context.Contacts.FindAsync(entityId);
                case "Company": return await _context.Companies.FindAsync(entityId);
                case "Opportunity": return await _context.Opportunities.FindAsync(entityId);
                case "Quote": return await _context.Quotes.FindAsync(entityId);
                case "Activity": return await _context.Activities.FindAsync(entityId);
                default: return null;
            }
        }

        private bool MatchesConditions(WorkflowRule rule, object? entity)
        {
            if (string.IsNullOrWhiteSpace(rule.TriggerConditions) || rule.TriggerConditions == "[]")
            {
                return true;
            }

            try
            {
                using (var doc = JsonDocument.Parse(rule.TriggerConditions))
                {
                    var root = doc.RootElement;
                    var conditionsArray = root.ValueKind == JsonValueKind.Array ? root :
                                         (root.TryGetProperty("conditions", out var p) ? p : root);

                    if (conditionsArray.ValueKind != JsonValueKind.Array) return true;

                    foreach (var condition in conditionsArray.EnumerateArray())
                    {
                        if (!condition.TryGetProperty("field", out var fieldProp)) continue;

                        string field = fieldProp.GetString() ?? "";
                        string op = condition.TryGetProperty("operator", out var opProp) ? opProp.GetString() ?? "equals" : "equals";
                        string val = condition.TryGetProperty("value", out var valProp) ? valProp.GetString() ?? "" : "";

                        // If entity is dictionary equivalent (e.g. JSON), use MatchProperty
                        bool matched = false;
                        if (entity is JsonElement jsonElement)
                        {
                            matched = MatchJsonProperty(jsonElement, field, op, val);
                        }
                        else if (entity != null)
                        {
                            matched = MatchEntityProperty(entity, field, op, val);
                        }
                        
                        // Start with AND logic (all must match)
                        // If we needed OR logic, the JSON structure would need "logic": "OR"
                        if (!matched) return false;
                    }
                }
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to evaluate conditions for workflow {WorkflowId}", rule.Id);
                return false;
            }
        }

        private bool MatchEntityProperty(object entity, string field, string op, string value)
        {
            try
            {
                var type = entity.GetType();
                var prop = type.GetProperty(field, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
                
                // Allow nested properties e.g. "Contact.FirstName" if Entity is Quote and has Contact property
                if (prop == null && field.Contains('.'))
                {
                    var parts = field.Split('.');
                    object? currentObj = entity;
                    foreach (var part in parts)
                    {
                        if (currentObj == null) return false;
                        var p = currentObj.GetType().GetProperty(part, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
                        if (p == null) return false;
                        currentObj = p.GetValue(currentObj);
                    }
                    
                    var finalVal = currentObj?.ToString() ?? "";
                    return EvaluateOperator(finalVal, op, value);
                }

                if (prop == null) return false;

                var propValue = prop.GetValue(entity);
                string actualValue = propValue?.ToString() ?? "";

                return EvaluateOperator(actualValue, op, value);
            }
            catch
            {
                return false;
            }
        }

        private bool MatchJsonProperty(JsonElement element, string field, string op, string value)
        {
             // Simple single-level for now, or dot notation if needed
             if (element.ValueKind == JsonValueKind.Object)
             {
                 if (element.TryGetProperty(field, out var prop))
                 {
                     string actual = prop.ToString();
                     if (prop.ValueKind == JsonValueKind.String) actual = prop.GetString() ?? "";
                     return EvaluateOperator(actual, op, value);
                 }
             }
             return false;
        }

        private bool EvaluateOperator(string actualValue, string op, string targetValue)
        {
            switch (op.ToLower())
            {
                case "equals":
                case "==":
                    return actualValue.Equals(targetValue, StringComparison.OrdinalIgnoreCase);
                case "notequals":
                case "!=":
                    return !actualValue.Equals(targetValue, StringComparison.OrdinalIgnoreCase);
                case "contains":
                    return actualValue.IndexOf(targetValue, StringComparison.OrdinalIgnoreCase) >= 0;
                case "notcontains":
                    return actualValue.IndexOf(targetValue, StringComparison.OrdinalIgnoreCase) < 0;
                case "startswith":
                    return actualValue.StartsWith(targetValue, StringComparison.OrdinalIgnoreCase);
                case "endswith":
                    return actualValue.EndsWith(targetValue, StringComparison.OrdinalIgnoreCase);
                case "greaterthan":
                case ">":
                    return double.TryParse(actualValue, out double v1) && double.TryParse(targetValue, out double v2) && v1 > v2;
                case "lessthan":
                case "<":
                    return double.TryParse(actualValue, out double v3) && double.TryParse(targetValue, out double v4) && v3 < v4;
                default:
                    return false;
            }
        }
    }
}

