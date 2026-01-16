using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models.Reporting;
using CRM.Api.DTOs.Reporting;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/reports/saved")]
    public class SavedReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SavedReportsController> _logger;

        public SavedReportsController(ApplicationDbContext context, ILogger<SavedReportsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private int GetUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdStr, out int uid) ? uid : 1;
        }

        // =============================================
        // SAVED REPORTS CRUD
        // =============================================

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SavedReportDto>>> GetSavedReports([FromQuery] string? category)
        {
            var userId = GetUserId();
            var query = _context.SavedReports
                .Where(r => r.CreatedByUserId == userId || r.IsPublic)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(category))
                query = query.Where(r => r.Category == category);

            var reports = await query
                .OrderBy(r => r.Category)
                .ThenBy(r => r.Name)
                .Select(r => new SavedReportDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    Category = r.Category,
                    ReportType = r.ReportType,
                    IsPublic = r.IsPublic,
                    IsScheduled = r.IsScheduled,
                    ScheduleFrequency = r.ScheduleFrequency,
                    CreatedByUserId = r.CreatedByUserId,
                    CreatedAt = r.CreatedAt,
                    LastRunAt = r.LastRunAt,
                    RunCount = r.RunCount
                })
                .ToListAsync();

            return Ok(reports);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetSavedReport(int id)
        {
            var report = await _context.SavedReports.FindAsync(id);
            if (report == null) return NotFound();

            return Ok(new
            {
                report.Id,
                report.Name,
                report.Description,
                report.Category,
                report.ReportType,
                report.Configuration,
                report.Columns,
                report.Filters,
                report.Sorting,
                report.Grouping,
                report.ChartSettings,
                report.IsPublic,
                report.IsScheduled,
                report.ScheduleFrequency,
                report.ScheduleRecipients,
                report.CreatedAt,
                report.LastRunAt,
                report.RunCount
            });
        }

        [HttpPost]
        public async Task<ActionResult<SavedReportDto>> CreateSavedReport(CreateSavedReportDto dto)
        {
            var report = new SavedReport
            {
                Name = dto.Name,
                Description = dto.Description,
                Category = dto.Category,
                ReportType = dto.ReportType,
                Configuration = dto.Configuration,
                Columns = dto.Columns,
                Filters = dto.Filters,
                Sorting = dto.Sorting,
                Grouping = dto.Grouping,
                ChartSettings = dto.ChartSettings,
                IsPublic = dto.IsPublic,
                CreatedByUserId = GetUserId(),
                CreatedAt = DateTime.UtcNow
            };

            _context.SavedReports.Add(report);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSavedReport), new { id = report.Id }, new SavedReportDto
            {
                Id = report.Id,
                Name = report.Name,
                Category = report.Category,
                ReportType = report.ReportType,
                CreatedAt = report.CreatedAt
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSavedReport(int id, UpdateSavedReportDto dto)
        {
            var report = await _context.SavedReports.FindAsync(id);
            if (report == null) return NotFound();

            report.Name = dto.Name;
            report.Description = dto.Description;
            report.Category = dto.Category;
            report.ReportType = dto.ReportType;
            report.Configuration = dto.Configuration;
            report.Columns = dto.Columns;
            report.Filters = dto.Filters;
            report.Sorting = dto.Sorting;
            report.Grouping = dto.Grouping;
            report.ChartSettings = dto.ChartSettings;
            report.IsPublic = dto.IsPublic;
            report.IsScheduled = dto.IsScheduled;
            report.ScheduleFrequency = dto.ScheduleFrequency;
            report.ScheduleRecipients = dto.ScheduleRecipients;
            report.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSavedReport(int id)
        {
            var report = await _context.SavedReports.FindAsync(id);
            if (report == null) return NotFound();

            _context.SavedReports.Remove(report);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // =============================================
        // RUN SAVED REPORT
        // =============================================

        [HttpPost("{id}/run")]
        public async Task<ActionResult<ReportResultDto>> RunSavedReport(int id, [FromQuery] string? format)
        {
            var report = await _context.SavedReports.FindAsync(id);
            if (report == null) return NotFound();

            var startTime = DateTime.UtcNow;

            // Parse configuration
            var columns = !string.IsNullOrWhiteSpace(report.Columns) 
                ? JsonSerializer.Deserialize<List<string>>(report.Columns) 
                : null;
            var filters = !string.IsNullOrWhiteSpace(report.Filters)
                ? JsonSerializer.Deserialize<List<ReportFilter>>(report.Filters)
                : null;

            // Run the report based on category
            var result = await ExecuteReport(report.Category, columns, filters, null);

            // Update run stats
            report.LastRunAt = DateTime.UtcNow;
            report.RunCount++;

            // Log execution
            var executionLog = new ReportExecutionLog
            {
                SavedReportId = id,
                ReportName = report.Name,
                ExportFormat = format ?? "View",
                RowCount = result.TotalCount,
                ExecutionTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds,
                ExecutedByUserId = GetUserId(),
                ExecutedAt = DateTime.UtcNow
            };
            _context.ReportExecutionLogs.Add(executionLog);

            await _context.SaveChangesAsync();

            // Export if requested
            if (format?.ToLower() == "csv")
            {
                return await ExportToCsv(result);
            }

            return Ok(result);
        }

        // =============================================
        // DYNAMIC REPORT BUILDER
        // =============================================

        [HttpPost("run")]
        public async Task<ActionResult<ReportResultDto>> RunDynamicReport(RunReportRequest request)
        {
            var result = await ExecuteReport(
                request.Category,
                request.Columns,
                request.Filters,
                request.Sorting,
                request.GroupBy,
                request.Page ?? 1,
                request.PageSize ?? 100
            );

            if (request.ExportFormat?.ToLower() == "csv")
            {
                return await ExportToCsv(result);
            }

            return Ok(result);
        }

        // =============================================
        // AVAILABLE FIELDS
        // =============================================

        [HttpGet("fields")]
        public ActionResult<IEnumerable<ReportCategoryFieldsDto>> GetAvailableFields()
        {
            var categories = new List<ReportCategoryFieldsDto>
            {
                new ReportCategoryFieldsDto
                {
                    Category = "Contacts",
                    Fields = new List<ReportFieldDto>
                    {
                        new() { Name = "FirstName", DisplayName = "First Name", DataType = "string" },
                        new() { Name = "LastName", DisplayName = "Last Name", DataType = "string" },
                        new() { Name = "Email", DisplayName = "Email", DataType = "string" },
                        new() { Name = "Phone", DisplayName = "Phone", DataType = "string" },
                        new() { Name = "JobTitle", DisplayName = "Job Title", DataType = "string" },
                        new() { Name = "Company", DisplayName = "Company", DataType = "string" },
                        new() { Name = "Status", DisplayName = "Status", DataType = "string", IsGroupable = true },
                        new() { Name = "ContactSource", DisplayName = "Source", DataType = "string", IsGroupable = true },
                        new() { Name = "CreatedAt", DisplayName = "Created Date", DataType = "date" }
                    }
                },
                new ReportCategoryFieldsDto
                {
                    Category = "Companies",
                    Fields = new List<ReportFieldDto>
                    {
                        new() { Name = "Name", DisplayName = "Company Name", DataType = "string" },
                        new() { Name = "Industry", DisplayName = "Industry", DataType = "string", IsGroupable = true },
                        new() { Name = "Website", DisplayName = "Website", DataType = "string" },
                        new() { Name = "Phone", DisplayName = "Phone", DataType = "string" },
                        new() { Name = "City", DisplayName = "City", DataType = "string", IsGroupable = true },
                        new() { Name = "State", DisplayName = "State", DataType = "string", IsGroupable = true },
                        new() { Name = "ContactCount", DisplayName = "# Contacts", DataType = "number" },
                        new() { Name = "CreatedAt", DisplayName = "Created Date", DataType = "date" }
                    }
                },
                new ReportCategoryFieldsDto
                {
                    Category = "Opportunities",
                    Fields = new List<ReportFieldDto>
                    {
                        new() { Name = "Name", DisplayName = "Deal Name", DataType = "string" },
                        new() { Name = "Amount", DisplayName = "Amount", DataType = "number" },
                        new() { Name = "Stage", DisplayName = "Stage", DataType = "string", IsGroupable = true },
                        new() { Name = "Probability", DisplayName = "Probability %", DataType = "number" },
                        new() { Name = "Source", DisplayName = "Source", DataType = "string", IsGroupable = true },
                        new() { Name = "Type", DisplayName = "Type", DataType = "string", IsGroupable = true },
                        new() { Name = "ExpectedCloseDate", DisplayName = "Expected Close", DataType = "date" },
                        new() { Name = "Contact", DisplayName = "Contact", DataType = "string" },
                        new() { Name = "Company", DisplayName = "Company", DataType = "string" },
                        new() { Name = "CreatedAt", DisplayName = "Created Date", DataType = "date" }
                    }
                },
                new ReportCategoryFieldsDto
                {
                    Category = "Activities",
                    Fields = new List<ReportFieldDto>
                    {
                        new() { Name = "Subject", DisplayName = "Subject", DataType = "string" },
                        new() { Name = "Type", DisplayName = "Type", DataType = "string", IsGroupable = true },
                        new() { Name = "Category", DisplayName = "Category", DataType = "string", IsGroupable = true },
                        new() { Name = "StartTime", DisplayName = "Start Time", DataType = "date" },
                        new() { Name = "IsCompleted", DisplayName = "Completed", DataType = "boolean" },
                        new() { Name = "Contact", DisplayName = "Contact", DataType = "string" },
                        new() { Name = "CreatedAt", DisplayName = "Created Date", DataType = "date" }
                    }
                }
            };

            return Ok(categories);
        }

        // =============================================
        // HELPER METHODS
        // =============================================

        private async Task<ReportResultDto> ExecuteReport(
            string category,
            List<string>? columns,
            List<ReportFilter>? filters,
            ReportSorting? sorting,
            string? groupBy = null,
            int page = 1,
            int pageSize = 100)
        {
            var result = new ReportResultDto
            {
                Category = category,
                Page = page,
                PageSize = pageSize
            };

            switch (category.ToLower())
            {
                case "contacts":
                    result = await ExecuteContactsReport(columns, filters, sorting, page, pageSize);
                    break;
                case "companies":
                    result = await ExecuteCompaniesReport(columns, filters, sorting, page, pageSize);
                    break;
                case "opportunities":
                    result = await ExecuteOpportunitiesReport(columns, filters, sorting, page, pageSize);
                    break;
                case "activities":
                    result = await ExecuteActivitiesReport(columns, filters, sorting, page, pageSize);
                    break;
            }

            return result;
        }

        private async Task<ReportResultDto> ExecuteContactsReport(
            List<string>? columns, List<ReportFilter>? filters, ReportSorting? sorting, int page, int pageSize)
        {
            var query = _context.Contacts.Include(c => c.Company).AsQueryable();

            // Apply filters
            if (filters != null)
            {
                foreach (var filter in filters)
                {
                    query = filter.Field.ToLower() switch
                    {
                        "status" => query.Where(c => c.Status == filter.Value),
                        "contactsource" => query.Where(c => c.ContactSource == filter.Value),
                        "jobtitle" => query.Where(c => c.JobTitle == filter.Value),
                        "email" when filter.Operator == "contains" => query.Where(c => c.Email!.Contains(filter.Value!)),
                        _ => query
                    };
                }
            }

            var totalCount = await query.CountAsync();

            // Sort
            query = sorting?.Field.ToLower() switch
            {
                "firstname" => sorting.Direction == "desc" ? query.OrderByDescending(c => c.FirstName) : query.OrderBy(c => c.FirstName),
                "email" => sorting.Direction == "desc" ? query.OrderByDescending(c => c.Email) : query.OrderBy(c => c.Email),
                "createdat" => sorting.Direction == "desc" ? query.OrderByDescending(c => c.CreatedAt) : query.OrderBy(c => c.CreatedAt),
                _ => query.OrderBy(c => c.LastName)
            };

            var data = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var defaultCols = columns ?? new List<string> { "FirstName", "LastName", "Email", "Phone", "Company", "Status" };

            return new ReportResultDto
            {
                Category = "Contacts",
                Columns = defaultCols,
                Rows = data.Select(c => new Dictionary<string, object?>
                {
                    ["Id"] = c.Id,
                    ["FirstName"] = c.FirstName,
                    ["LastName"] = c.LastName,
                    ["Email"] = c.Email,
                    ["Phone"] = c.Phone,
                    ["JobTitle"] = c.JobTitle,
                    ["Company"] = c.Company?.Name,
                    ["Status"] = c.Status,
                    ["ContactSource"] = c.ContactSource,
                    ["CreatedAt"] = c.CreatedAt
                }).ToList(),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };
        }

        private async Task<ReportResultDto> ExecuteCompaniesReport(
            List<string>? columns, List<ReportFilter>? filters, ReportSorting? sorting, int page, int pageSize)
        {
            var query = _context.Companies.Include(c => c.Contacts).AsQueryable();

            var totalCount = await query.CountAsync();

            var data = await query
                .OrderBy(c => c.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var defaultCols = columns ?? new List<string> { "Name", "Industry", "Website", "Phone", "City", "ContactCount" };

            return new ReportResultDto
            {
                Category = "Companies",
                Columns = defaultCols,
                Rows = data.Select(c => new Dictionary<string, object?>
                {
                    ["Id"] = c.Id,
                    ["Name"] = c.Name,
                    ["Industry"] = c.Industry,
                    ["Website"] = c.Website,
                    ["Phone"] = c.Phone,
                    ["City"] = c.City,
                    ["State"] = c.State,
                    ["ContactCount"] = c.Contacts?.Count ?? 0,
                    ["CreatedAt"] = c.CreatedAt
                }).ToList(),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };
        }

        private async Task<ReportResultDto> ExecuteOpportunitiesReport(
            List<string>? columns, List<ReportFilter>? filters, ReportSorting? sorting, int page, int pageSize)
        {
            var query = _context.Opportunities
                .Include(o => o.Contact)
                .Include(o => o.Company)
                .AsQueryable();

            var totalCount = await query.CountAsync();

            var data = await query
                .OrderByDescending(o => o.Amount)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var defaultCols = columns ?? new List<string> { "Name", "Amount", "Stage", "Probability", "ExpectedCloseDate", "Contact", "Company" };

            return new ReportResultDto
            {
                Category = "Opportunities",
                Columns = defaultCols,
                Rows = data.Select(o => new Dictionary<string, object?>
                {
                    ["Id"] = o.Id,
                    ["Name"] = o.Name,
                    ["Amount"] = o.Amount,
                    ["Stage"] = o.Stage,
                    ["Probability"] = o.Probability,
                    ["ExpectedCloseDate"] = o.ExpectedCloseDate,
                    ["Contact"] = o.Contact != null ? $"{o.Contact.FirstName} {o.Contact.LastName}" : null,
                    ["Company"] = o.Company?.Name,
                    ["Source"] = o.Source,
                    ["Type"] = o.Type,
                    ["CreatedAt"] = o.CreatedAt
                }).ToList(),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                Summary = new ReportSummary
                {
                    RowCount = totalCount,
                    Aggregations = new Dictionary<string, object>
                    {
                        ["TotalAmount"] = data.Sum(o => o.Amount),
                        ["AvgAmount"] = data.Any() ? data.Average(o => o.Amount) : 0
                    }
                }
            };
        }

        private async Task<ReportResultDto> ExecuteActivitiesReport(
            List<string>? columns, List<ReportFilter>? filters, ReportSorting? sorting, int page, int pageSize)
        {
            var query = _context.Activities
                .Include(a => a.Contact)
                .AsQueryable();

            var totalCount = await query.CountAsync();

            var data = await query
                .OrderByDescending(a => a.StartTime)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var defaultCols = columns ?? new List<string> { "Subject", "Type", "Category", "StartTime", "IsCompleted", "Contact" };

            return new ReportResultDto
            {
                Category = "Activities",
                Columns = defaultCols,
                Rows = data.Select(a => new Dictionary<string, object?>
                {
                    ["Id"] = a.Id,
                    ["Subject"] = a.Subject,
                    ["Type"] = a.Type,
                    ["Category"] = a.Category,
                    ["StartTime"] = a.StartTime,
                    ["IsCompleted"] = a.IsCompleted,
                    ["Contact"] = a.Contact != null ? $"{a.Contact.FirstName} {a.Contact.LastName}" : null,
                    ["CreatedAt"] = a.CreatedAt
                }).ToList(),
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };
        }

        private async Task<FileContentResult> ExportToCsv(ReportResultDto result)
        {
            var csv = new StringBuilder();
            
            // Header
            csv.AppendLine(string.Join(",", result.Columns.Select(c => $"\"{c}\"")));
            
            // Rows
            foreach (var row in result.Rows)
            {
                var values = result.Columns.Select(col => 
                    row.TryGetValue(col, out var val) ? $"\"{val}\"" : "\"\"");
                csv.AppendLine(string.Join(",", values));
            }

            var bytes = Encoding.UTF8.GetBytes(csv.ToString());
            return File(bytes, "text/csv", $"{result.Category.ToLower()}_report.csv");
        }
    }
}
