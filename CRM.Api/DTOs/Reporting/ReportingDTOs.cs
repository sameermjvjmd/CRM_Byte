using System.ComponentModel.DataAnnotations;

namespace CRM.Api.DTOs.Reporting
{
    // =============================================
    // Saved Report DTOs
    // =============================================
    public class SavedReportDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = "Custom";
        public string ReportType { get; set; } = "Table";
        public bool IsPublic { get; set; }
        public bool IsScheduled { get; set; }
        public string? ScheduleFrequency { get; set; }
        public int CreatedByUserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastRunAt { get; set; }
        public int RunCount { get; set; }
    }

    public class CreateSavedReportDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        public string Category { get; set; } = "Custom";

        public string ReportType { get; set; } = "Table";

        public string? Configuration { get; set; }
        public string? Columns { get; set; }
        public string? Filters { get; set; }
        public string? Sorting { get; set; }
        public string? Grouping { get; set; }
        public string? ChartSettings { get; set; }

        public bool IsPublic { get; set; } = false;
    }

    public class UpdateSavedReportDto : CreateSavedReportDto
    {
        public bool IsScheduled { get; set; }
        public string? ScheduleFrequency { get; set; }
        public string? ScheduleRecipients { get; set; }
    }

    // =============================================
    // Report Builder Request DTOs
    // =============================================
    public class RunReportRequest
    {
        [Required]
        public string Category { get; set; } = "Contacts"; // Contacts, Companies, Opportunities, Activities, Marketing

        public List<string>? Columns { get; set; }
        public List<ReportFilter>? Filters { get; set; }
        public ReportSorting? Sorting { get; set; }
        public string? GroupBy { get; set; }

        public int? Page { get; set; } = 1;
        public int? PageSize { get; set; } = 100;

        public string? ExportFormat { get; set; } // null = View, CSV, Excel
    }

    public class ReportFilter
    {
        public string Field { get; set; } = string.Empty;
        public string Operator { get; set; } = "equals"; // equals, contains, startsWith, endsWith, greaterThan, lessThan, between, isNull, isNotNull
        public string? Value { get; set; }
        public string? Value2 { get; set; } // For 'between' operator
    }

    public class ReportSorting
    {
        public string Field { get; set; } = string.Empty;
        public string Direction { get; set; } = "asc"; // asc, desc
    }

    // =============================================
    // Report Response DTOs
    // =============================================
    public class ReportResultDto
    {
        public string Category { get; set; } = string.Empty;
        public List<string> Columns { get; set; } = new();
        public List<Dictionary<string, object?>> Rows { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public ReportSummary? Summary { get; set; }
    }

    public class ReportSummary
    {
        public int RowCount { get; set; }
        public Dictionary<string, object>? Aggregations { get; set; }
    }

    // =============================================
    // Available Fields DTOs
    // =============================================
    public class ReportFieldDto
    {
        public string Name { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string DataType { get; set; } = "string"; // string, number, date, boolean
        public bool IsFilterable { get; set; } = true;
        public bool IsSortable { get; set; } = true;
        public bool IsGroupable { get; set; } = false;
    }

    public class ReportCategoryFieldsDto
    {
        public string Category { get; set; } = string.Empty;
        public List<ReportFieldDto> Fields { get; set; } = new();
    }
}
