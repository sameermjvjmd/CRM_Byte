using System.ComponentModel.DataAnnotations;

namespace CRM.Api.Models.Reporting
{
    // =============================================
    // Saved Report Definition
    // =============================================
    public class SavedReport
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        [StringLength(50)]
        public string Category { get; set; } = "Custom"; // Contacts, Companies, Opportunities, Activities, Marketing, Custom

        [Required]
        [StringLength(50)]
        public string ReportType { get; set; } = "Table"; // Table, Chart, Summary

        // Report Configuration (JSON)
        public string? Configuration { get; set; }

        // Selected columns (JSON array)
        public string? Columns { get; set; }

        // Filters (JSON)
        public string? Filters { get; set; }

        // Sorting (JSON)
        public string? Sorting { get; set; }

        // Grouping (JSON)
        public string? Grouping { get; set; }

        // Chart settings if applicable (JSON)
        public string? ChartSettings { get; set; }

        // Access control
        public bool IsPublic { get; set; } = false;
        public int CreatedByUserId { get; set; }

        // Schedule (for automated reports)
        public bool IsScheduled { get; set; } = false;
        
        [StringLength(50)]
        public string? ScheduleFrequency { get; set; } // Daily, Weekly, Monthly

        [StringLength(255)]
        public string? ScheduleRecipients { get; set; } // Comma-separated emails

        // Metadata
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? LastRunAt { get; set; }
        public int RunCount { get; set; } = 0;
    }

    // =============================================
    // Report Execution Log
    // =============================================
    public class ReportExecutionLog
    {
        public int Id { get; set; }
        public int? SavedReportId { get; set; }
        public SavedReport? SavedReport { get; set; }

        [StringLength(200)]
        public string ReportName { get; set; } = string.Empty;

        [StringLength(50)]
        public string ExportFormat { get; set; } = "View"; // View, CSV, PDF, Excel

        public int RowCount { get; set; }
        public int ExecutionTimeMs { get; set; }

        public int ExecutedByUserId { get; set; }
        public DateTime ExecutedAt { get; set; } = DateTime.UtcNow;
    }

    // =============================================
    // Constants
    // =============================================
    public static class ReportCategories
    {
        public const string Contacts = "Contacts";
        public const string Companies = "Companies";
        public const string Opportunities = "Opportunities";
        public const string Activities = "Activities";
        public const string Marketing = "Marketing";
        public const string Custom = "Custom";

        public static readonly string[] All = { Contacts, Companies, Opportunities, Activities, Marketing, Custom };
    }

    public static class ReportTypes
    {
        public const string Table = "Table";
        public const string Chart = "Chart";
        public const string Summary = "Summary";
        public const string KPI = "KPI";

        public static readonly string[] All = { Table, Chart, Summary, KPI };
    }
}
