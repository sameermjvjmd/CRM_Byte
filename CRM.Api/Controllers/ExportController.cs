using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CRM.Api.Data;
using Microsoft.EntityFrameworkCore;
using System.Text;
using ClosedXML.Excel;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ExportController> _logger;

        public ExportController(ApplicationDbContext context, ILogger<ExportController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("contacts/csv")]
        public async Task<IActionResult> ExportContactsCsv([FromBody] ExportRequest request)
        {
            try
            {
                var query = _context.Contacts.Include(c => c.Company).AsQueryable();

                // Apply filters if IDs are provided
                if (request.Ids != null && request.Ids.Any())
                {
                    query = query.Where(c => request.Ids.Contains(c.Id));
                }

                var contacts = await query.ToListAsync();

                var csv = new StringBuilder();
                
                // Header
                csv.AppendLine(string.Join(",", request.Fields));

                // Data rows
                foreach (var contact in contacts)
                {
                    var values = request.Fields.Select(field => GetContactFieldValue(contact, field));
                    csv.AppendLine(string.Join(",", values.Select(v => EscapeCsvValue(v))));
                }

                var bytes = Encoding.UTF8.GetBytes(csv.ToString());
                return File(bytes, "text/csv", $"contacts_export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to export contacts to CSV");
                return StatusCode(500, new { error = "Export failed", message = ex.Message });
            }
        }

        [HttpPost("contacts/excel")]
        public async Task<IActionResult> ExportContactsExcel([FromBody] ExportRequest request)
        {
            try
            {
                var query = _context.Contacts.Include(c => c.Company).AsQueryable();

                if (request.Ids != null && request.Ids.Any())
                {
                    query = query.Where(c => request.Ids.Contains(c.Id));
                }

                var contacts = await query.ToListAsync();

                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("Contacts");

                // Header
                for (int i = 0; i < request.Fields.Count; i++)
                {
                    worksheet.Cell(1, i + 1).Value = request.Fields[i];
                    worksheet.Cell(1, i + 1).Style.Font.Bold = true;
                    worksheet.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.LightGray;
                }

                // Data
                int row = 2;
                foreach (var contact in contacts)
                {
                    for (int i = 0; i < request.Fields.Count; i++)
                    {
                        var value = GetContactFieldValue(contact, request.Fields[i]);
                        worksheet.Cell(row, i + 1).Value = value;
                    }
                    row++;
                }

                // Auto-fit columns
                worksheet.Columns().AdjustToContents();

                using var stream = new MemoryStream();
                workbook.SaveAs(stream);
                var bytes = stream.ToArray();

                return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                    $"contacts_export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to export contacts to Excel");
                return StatusCode(500, new { error = "Export failed", message = ex.Message });
            }
        }

        [HttpPost("companies/csv")]
        public async Task<IActionResult> ExportCompaniesCsv([FromBody] ExportRequest request)
        {
            try
            {
                var query = _context.Companies.AsQueryable();

                if (request.Ids != null && request.Ids.Any())
                {
                    query = query.Where(c => request.Ids.Contains(c.Id));
                }

                var companies = await query.ToListAsync();

                var csv = new StringBuilder();
                csv.AppendLine(string.Join(",", request.Fields));

                foreach (var company in companies)
                {
                    var values = request.Fields.Select(field => GetCompanyFieldValue(company, field));
                    csv.AppendLine(string.Join(",", values.Select(v => EscapeCsvValue(v))));
                }

                var bytes = Encoding.UTF8.GetBytes(csv.ToString());
                return File(bytes, "text/csv", $"companies_export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to export companies to CSV");
                return StatusCode(500, new { error = "Export failed", message = ex.Message });
            }
        }

        [HttpPost("companies/excel")]
        public async Task<IActionResult> ExportCompaniesExcel([FromBody] ExportRequest request)
        {
            try
            {
                var query = _context.Companies.AsQueryable();

                if (request.Ids != null && request.Ids.Any())
                {
                    query = query.Where(c => request.Ids.Contains(c.Id));
                }

                var companies = await query.ToListAsync();

                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("Companies");

                // Header
                for (int i = 0; i < request.Fields.Count; i++)
                {
                    worksheet.Cell(1, i + 1).Value = request.Fields[i];
                    worksheet.Cell(1, i + 1).Style.Font.Bold = true;
                    worksheet.Cell(1, i + 1).Style.Fill.BackgroundColor = XLColor.LightGray;
                }

                // Data
                int row = 2;
                foreach (var company in companies)
                {
                    for (int i = 0; i < request.Fields.Count; i++)
                    {
                        var value = GetCompanyFieldValue(company, request.Fields[i]);
                        worksheet.Cell(row, i + 1).Value = value;
                    }
                    row++;
                }

                worksheet.Columns().AdjustToContents();

                using var stream = new MemoryStream();
                workbook.SaveAs(stream);
                var bytes = stream.ToArray();

                return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"companies_export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to export companies to Excel");
                return StatusCode(500, new { error = "Export failed", message = ex.Message });
            }
        }

        private string GetContactFieldValue(Models.Contact contact, string fieldName)
        {
            return fieldName switch
            {
                "FirstName" => contact.FirstName ?? "",
                "LastName" => contact.LastName ?? "",
                "Email" => contact.Email ?? "",
                "Phone" => contact.Phone ?? "",
                "MobilePhone" => contact.MobilePhone ?? "",
                "Company" => contact.Company?.Name ?? "",
                "JobTitle" => contact.JobTitle ?? "",
                "Department" => contact.Department ?? "",
                "LeadSource" => contact.LeadSource ?? "",
                "Status" => contact.Status ?? "",
                "Address1" => contact.Address1 ?? "",
                "City" => contact.City ?? "",
                "State" => contact.State ?? "",
                "Zip" => contact.Zip ?? "",
                "Country" => contact.Country ?? "",
                "Website" => contact.Website ?? "",
                "Notes" => contact.Notes ?? "",
                "Salutation" => contact.Salutation ?? "",
                "Fax" => contact.Fax ?? "",
                "CreatedAt" => contact.CreatedAt.ToString("yyyy-MM-dd"),
                _ => ""
            };
        }

        private string GetCompanyFieldValue(Models.Company company, string fieldName)
        {
            return fieldName switch
            {
                "Name" => company.Name ?? "",
                "Industry" => company.Industry ?? "",
                "Website" => company.Website ?? "",
                "Phone" => company.Phone ?? "",
                "Email" => company.Email ?? "",
                "Address" => company.Address ?? "",
                "City" => company.City ?? "",
                "State" => company.State ?? "",
                "ZipCode" => company.ZipCode ?? "",
                "Country" => company.Country ?? "",
                "Description" => company.Description ?? "",
                "EmployeeCount" => company.EmployeeCount?.ToString() ?? "",
                "AnnualRevenue" => company.AnnualRevenue?.ToString("N2") ?? "",
                "CreatedAt" => company.CreatedAt.ToString("yyyy-MM-dd"),
                _ => ""
            };
        }

        private string EscapeCsvValue(string value)
        {
            if (string.IsNullOrEmpty(value)) return "";
            
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
            {
                return $"\"{value.Replace("\"", "\"\"")}\"";
            }
            return value;
        }
    }

    public class ExportRequest
    {
        public List<string> Fields { get; set; } = new();
        public List<int>? Ids { get; set; }
    }
}
