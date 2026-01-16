using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CRM.Api.Models
{
    public class Activity
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Subject { get; set; } = string.Empty;

        // =============================================
        // Activity Type & Classification
        // =============================================
        public string Type { get; set; } = "Call";
        // Types: Call, CallAttempt, CallReached, CallLeftMessage, Meeting, 
        //        To-Do, Email, Appointment, Event, Follow-up, Personal, Vacation, Letter, Fax
        
        [StringLength(50)]
        public string? Category { get; set; } // Custom categories
        
        // =============================================
        // Timing
        // =============================================
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        
        public bool IsAllDay { get; set; } = false;
        
        // Duration in minutes (auto-calculated or manual)
        public int DurationMinutes => (int)(EndTime - StartTime).TotalMinutes;

        // =============================================
        // Status & Outcome
        // =============================================
        public bool IsCompleted { get; set; } = false;
        
        public DateTime? CompletedAt { get; set; }
        
        [StringLength(50)]
        public string? Result { get; set; } // Completed, Attempted, Left Message, No Answer, Busy, Rescheduled
        
        [StringLength(500)]
        public string? Outcome { get; set; } // Detailed outcome notes

        // =============================================
        // Recurring Activities
        // =============================================
        public bool IsRecurring { get; set; } = false;
        
        [StringLength(20)]
        public string? RecurrencePattern { get; set; } // Daily, Weekly, BiWeekly, Monthly, Yearly
        
        public int RecurrenceInterval { get; set; } = 1; // Every 1 day/week/month etc.
        
        public DateTime? RecurrenceEndDate { get; set; }
        
        public int? RecurrenceCount { get; set; } // Number of occurrences (alternative to end date)
        
        [StringLength(50)]
        public string? RecurrenceDays { get; set; } // For weekly: "Mon,Wed,Fri"
        
        // Links recurring instances to their parent/series
        public int? SeriesId { get; set; }
        public Activity? Series { get; set; }
        public ICollection<Activity> SeriesInstances { get; set; } = new List<Activity>();

        // =============================================
        // Reminder/Alarm
        // =============================================
        public bool HasReminder { get; set; } = false;
        
        public int ReminderMinutesBefore { get; set; } = 15; // 15 min, 30 min, 1 hour, 1 day, etc.
        
        public bool ReminderSent { get; set; } = false;
        
        public DateTime? ReminderTime => HasReminder ? StartTime.AddMinutes(-ReminderMinutesBefore) : null;

        // =============================================
        // Links & Associations
        // =============================================
        public int? ContactId { get; set; }
        public Contact? Contact { get; set; }
        
        public int? CompanyId { get; set; }
        public Company? Company { get; set; }
        
        public int? OpportunityId { get; set; }
        public Opportunity? Opportunity { get; set; }

        // =============================================
        // Priority & Visibility
        // =============================================
        [StringLength(20)]
        public string? Priority { get; set; } = "Normal"; // High, Normal, Low
        
        public bool IsPrivate { get; set; } = false;

        // =============================================
        // Location & Details
        // =============================================
        [StringLength(500)]
        public string? Location { get; set; }
        
        public string? Notes { get; set; }
        
        [StringLength(500)]
        public string? MeetingLink { get; set; } // Zoom, Teams, etc.

        // =============================================
        // Attendees (for meetings/appointments)
        // =============================================
        [StringLength(1000)]
        public string? Attendees { get; set; } // JSON array of attendee info
        
        public int? OwnerId { get; set; } // User who created/owns this activity

        // =============================================
        // Color Coding
        // =============================================
        [StringLength(20)]
        public string? Color { get; set; } // Custom color override

        // =============================================
        // Timestamps
        // =============================================
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastModifiedAt { get; set; }
    }

    // =============================================
    // Activity Type Constants
    // =============================================
    public static class ActivityTypes
    {
        public const string Call = "Call";
        public const string CallAttempt = "CallAttempt";
        public const string CallReached = "CallReached";
        public const string CallLeftMessage = "CallLeftMessage";
        public const string Meeting = "Meeting";
        public const string ToDo = "To-Do";
        public const string Email = "Email";
        public const string Appointment = "Appointment";
        public const string Event = "Event";
        public const string FollowUp = "Follow-up";
        public const string Personal = "Personal";
        public const string Vacation = "Vacation";
        public const string Letter = "Letter";
        public const string Fax = "Fax";

        public static readonly string[] All = new[]
        {
            Call, CallAttempt, CallReached, CallLeftMessage, Meeting, ToDo,
            Email, Appointment, Event, FollowUp, Personal, Vacation, Letter, Fax
        };

        public static readonly Dictionary<string, string> Colors = new()
        {
            { Call, "#3B82F6" },           // Blue
            { CallAttempt, "#6366F1" },    // Indigo
            { CallReached, "#22C55E" },    // Green
            { CallLeftMessage, "#EAB308" }, // Yellow
            { Meeting, "#8B5CF6" },        // Purple
            { ToDo, "#F97316" },           // Orange
            { Email, "#06B6D4" },          // Cyan
            { Appointment, "#EC4899" },    // Pink
            { Event, "#14B8A6" },          // Teal
            { FollowUp, "#F59E0B" },       // Amber
            { Personal, "#64748B" },       // Slate
            { Vacation, "#10B981" },       // Emerald
            { Letter, "#84CC16" },         // Lime
            { Fax, "#78716C" }             // Stone
        };
    }

    // =============================================
    // Activity Result Constants
    // =============================================
    public static class ActivityResults
    {
        public const string Completed = "Completed";
        public const string Attempted = "Attempted";
        public const string LeftMessage = "LeftMessage";
        public const string NoAnswer = "NoAnswer";
        public const string Busy = "Busy";
        public const string Rescheduled = "Rescheduled";
        public const string Cancelled = "Cancelled";
        public const string NotReached = "NotReached";

        public static readonly string[] All = new[]
        {
            Completed, Attempted, LeftMessage, NoAnswer, Busy, Rescheduled, Cancelled, NotReached
        };
    }

    // =============================================
    // Recurrence Pattern Constants
    // =============================================
    public static class RecurrencePatterns
    {
        public const string Daily = "Daily";
        public const string Weekly = "Weekly";
        public const string BiWeekly = "BiWeekly";
        public const string Monthly = "Monthly";
        public const string Yearly = "Yearly";

        public static readonly string[] All = new[]
        {
            Daily, Weekly, BiWeekly, Monthly, Yearly
        };
    }
}
