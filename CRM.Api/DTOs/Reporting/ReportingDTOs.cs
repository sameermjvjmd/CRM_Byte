using System.ComponentModel.DataAnnotations;
using CRM.Api.Models.Reporting;

namespace CRM.Api.DTOs.Reporting
{
    // Request to run a dynamic report
    public class ReportRunRequestDto
    {
        [Required]
        public string Category { get; set; } = string.Empty;

        public List<string> Columns { get; set; } = new List<string>();
        
        public List<ReportFilterDto> Filters { get; set; } = new List<ReportFilterDto>();
        
        public ReportSortingDto? Sorting { get; set; }
        
        public int? SavedReportId { get; set; }
        public string? ReportName { get; set; }

        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    public class ReportFilterDto
    {
        public string Field { get; set; } = string.Empty;
        public string Operator { get; set; } = "equals"; // equals, contains, starts_with, greater_than, less_than
        public string Value { get; set; } = string.Empty;
    }

    public class ReportSortingDto
    {
        public string Field { get; set; } = string.Empty;
        public string Direction { get; set; } = "asc"; // asc, desc
    }

    // Response for report execution
    public class ReportResultDto
    {
        public List<string> Columns { get; set; } = new List<string>();
        public List<Dictionary<string, object>> Rows { get; set; } = new List<Dictionary<string, object>>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }

    // CRUD DTOs for SavedReport
    public class CreateSavedReportDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Required]
        public string Category { get; set; } = string.Empty;
        
        public string ReportType { get; set; } = "Table";

        public string Columns { get; set; } = "[]"; // JSON
        public string Filters { get; set; } = "[]"; // JSON
        public string Sorting { get; set; } = "{}"; // JSON
        
        public bool IsPublic { get; set; }
    }

    public class SavedReportDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public string ReportType { get; set; } = string.Empty;
        public string? Columns { get; set; }
        public string? Filters { get; set; }
        public string? Sorting { get; set; }
        public bool IsPublic { get; set; }
        public int CreatedByUserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastRunAt { get; set; }
    }
}
