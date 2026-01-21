using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CRM.Api.Models
{
    /// <summary>
    /// Workflow automation rule definition
    /// </summary>
    public class WorkflowRule
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        // Status
        public bool IsActive { get; set; } = true;

        // Trigger Configuration
        [Required]
        [StringLength(50)]
        public string TriggerType { get; set; } = "OnRecordCreate";  // OnRecordCreate, OnRecordUpdate, OnFieldChange, OnStageChange, OnSchedule

        [Required]
        [StringLength(50)]
        public string EntityType { get; set; } = "Contact";  // Contact, Company, Opportunity, Activity, Quote

        // Trigger Conditions (JSON)
        public string? TriggerConditions { get; set; }  // e.g., {"field": "Status", "operator": "equals", "value": "Active"}

        // Action Configuration
        [Required]
        [StringLength(50)]
        public string ActionType { get; set; } = "SendEmail";  // SendEmail, CreateTask, UpdateField, SendNotification, Webhook

        // Action Parameters (JSON)
        public string? ActionParameters { get; set; }  // e.g., {"templateId": 5, "to": "{Contact.Email}"}

        // Execution Order
        public int Priority { get; set; } = 0;

        // Timing
        public int DelayMinutes { get; set; } = 0;  // Delay before executing action

        // Error Handling
        public bool StopOnError { get; set; } = false;
        public int RetryCount { get; set; } = 0;

        // Statistics
        public int ExecutionCount { get; set; } = 0;
        public int SuccessCount { get; set; } = 0;
        public int FailureCount { get; set; } = 0;
        public DateTime? LastExecutedAt { get; set; }

        // Owner
        public int? CreatedById { get; set; }

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastModifiedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Log of workflow executions
    /// </summary>
    public class WorkflowExecutionLog
    {
        public int Id { get; set; }

        public int WorkflowRuleId { get; set; }
        public WorkflowRule? WorkflowRule { get; set; }

        [StringLength(50)]
        public string Status { get; set; } = "Pending";  // Pending, Running, Success, Failed, Cancelled

        public int? EntityId { get; set; }

        [StringLength(50)]
        public string? EntityType { get; set; }

        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ScheduledExecutionTime { get; set; }
        public DateTime? CompletedAt { get; set; }

        public string? InputData { get; set; }  // JSON of input/trigger data
        public string? OutputData { get; set; }  // JSON of result data
        public string? ErrorMessage { get; set; }

        public int RetryAttempt { get; set; } = 0;
    }

    /// <summary>
    /// Trigger type constants
    /// </summary>
    public static class WorkflowTriggerTypes
    {
        public const string OnRecordCreate = "OnRecordCreate";
        public const string OnRecordUpdate = "OnRecordUpdate";
        public const string OnFieldChange = "OnFieldChange";
        public const string OnStageChange = "OnStageChange";
        public const string OnSchedule = "OnSchedule";
        public const string OnFormSubmission = "OnFormSubmission";

        public static readonly string[] All = { OnRecordCreate, OnRecordUpdate, OnFieldChange, OnStageChange, OnSchedule, OnFormSubmission };
    }

    /// <summary>
    /// Action type constants
    /// </summary>
    public static class WorkflowActionTypes
    {
        public const string SendEmail = "SendEmail";
        public const string CreateTask = "CreateTask";
        public const string UpdateField = "UpdateField";
        public const string SendNotification = "SendNotification";
        public const string Webhook = "Webhook";
        public const string CreateActivity = "CreateActivity";

        public static readonly string[] All = { SendEmail, CreateTask, UpdateField, SendNotification, Webhook, CreateActivity };
    }

    /// <summary>
    /// Entity types for workflows
    /// </summary>
    public static class WorkflowEntityTypes
    {
        public const string Contact = "Contact";
        public const string Company = "Company";
        public const string Opportunity = "Opportunity";
        public const string Activity = "Activity";
        public const string Quote = "Quote";

        public static readonly string[] All = { Contact, Company, Opportunity, Activity, Quote };
    }
}
