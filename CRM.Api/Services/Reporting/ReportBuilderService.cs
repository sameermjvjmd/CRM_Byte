using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.DTOs.Reporting;
using CRM.Api.Models;
using CRM.Api.Models.Reporting; // For SavedReport

namespace CRM.Api.Services.Reporting
{
    public class ReportBuilderService : IReportBuilderService
    {
        private readonly ApplicationDbContext _context;

        public ReportBuilderService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<SavedReportDto> CreateSavedReportAsync(int userId, CreateSavedReportDto dto)
        {
            var report = new SavedReport
            {
                Name = dto.Name,
                Description = dto.Description,
                Category = dto.Category,
                ReportType = dto.ReportType,
                Columns = dto.Columns,
                Filters = dto.Filters,
                Sorting = dto.Sorting,
                IsPublic = dto.IsPublic,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.SavedReports.Add(report);
            await _context.SaveChangesAsync();

            return MapToDto(report);
        }

        public async Task<bool> DeleteSavedReportAsync(int id, int userId)
        {
            var report = await _context.SavedReports.FindAsync(id);
            if (report == null) return false;

            // Only owner can delete (or admin - handled by controller/policy usually, but basic check here)
            if (report.CreatedByUserId != userId) return false; // Simple check

            _context.SavedReports.Remove(report);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<SavedReportDto?> GetSavedReportAsync(int id)
        {
            var report = await _context.SavedReports.FindAsync(id);
            return report == null ? null : MapToDto(report);
        }

        public async Task<IEnumerable<SavedReportDto>> GetSavedReportsAsync(int userId, bool includePublic = true)
        {
            var query = _context.SavedReports.AsQueryable();

            if (includePublic)
            {
                query = query.Where(r => r.CreatedByUserId == userId || r.IsPublic);
            }
            else
            {
                query = query.Where(r => r.CreatedByUserId == userId);
            }

            return await query
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => MapToDto(r))
                .ToListAsync();
        }

        public async Task<ReportResultDto> ExecuteReportAsync(ReportRunRequestDto request, int userId)
        {
            var startTime = DateTime.UtcNow;
            
            ReportResultDto result;

            switch (request.Category)
            {
                case "Contacts":
                    result = await RunContactsReport(request);
                    break;
                case "Companies":
                    result = await RunCompaniesReport(request);
                    break;
                case "Opportunities":
                    result = await RunOpportunitiesReport(request);
                    break;
                case "Activities":
                    result = await RunActivitiesReport(request);
                    break;
                default:
                    throw new ArgumentException($"Category '{request.Category}' not supported yet.");
            }

            // Logging
            try
            {
                var executionTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;
                var log = new ReportExecutionLog
                {
                    SavedReportId = request.SavedReportId,
                    ReportName = request.ReportName ?? $"{request.Category} Report",
                    ExportFormat = "View", 
                    RowCount = result.TotalCount,
                    ExecutionTimeMs = executionTimeMs,
                    ExecutedByUserId = userId,
                    ExecutedAt = DateTime.UtcNow
                };

                _context.ReportExecutionLogs.Add(log);

                if (request.SavedReportId.HasValue)
                {
                    var savedReport = await _context.SavedReports.FindAsync(request.SavedReportId.Value);
                    if (savedReport != null)
                    {
                        savedReport.LastRunAt = DateTime.UtcNow;
                        savedReport.RunCount++;
                    }
                }

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Should use logger here ideally
                Console.WriteLine($"Error logging report execution: {ex.Message}");
            }

            return result;
        }

        // ===========================================
        // CONTACTS REPORT
        // ===========================================
        private async Task<ReportResultDto> RunContactsReport(ReportRunRequestDto request)
        {
            var query = _context.Contacts
                .Include(c => c.Company)
                .AsQueryable();

            // 1. Filtering
            foreach (var filter in request.Filters)
            {
                if (string.IsNullOrWhiteSpace(filter.Value)) continue;

                switch (filter.Field)
                {
                    case "FirstName": query = ApplyStringFilter(query, c => c.FirstName, filter); break;
                    case "LastName": query = ApplyStringFilter(query, c => c.LastName, filter); break;
                    case "Email": query = ApplyStringFilter(query, c => c.Email, filter); break;
                    case "Phone": query = ApplyStringFilter(query, c => c.Phone, filter); break;
                    case "JobTitle": query = ApplyStringFilter(query, c => c.JobTitle, filter); break;
                    case "City": query = ApplyStringFilter(query, c => c.City, filter); break;
                    case "State": query = ApplyStringFilter(query, c => c.State, filter); break;
                    case "Status": query = ApplyStringFilter(query, c => c.Status, filter); break;
                    case "ContactSource": query = ApplyStringFilter(query, c => c.ContactSource, filter); break;
                    case "Company": query = ApplyStringFilter(query, c => c.Company.Name, filter); break;
                    case "CreatedAt": query = ApplyDateFilter(query, c => c.CreatedAt, filter); break;
                }
            }

            // 2. Sorting
            if (request.Sorting != null && !string.IsNullOrWhiteSpace(request.Sorting.Field))
            {
                bool asc = request.Sorting.Direction == "asc";
                switch (request.Sorting.Field)
                {
                    case "FirstName": query = asc ? query.OrderBy(c => c.FirstName) : query.OrderByDescending(c => c.FirstName); break;
                    case "LastName": query = asc ? query.OrderBy(c => c.LastName) : query.OrderByDescending(c => c.LastName); break;
                    case "Email": query = asc ? query.OrderBy(c => c.Email) : query.OrderByDescending(c => c.Email); break;
                    case "Company": query = asc ? query.OrderBy(c => c.Company.Name) : query.OrderByDescending(c => c.Company.Name); break;
                    case "CreatedAt": query = asc ? query.OrderBy(c => c.CreatedAt) : query.OrderByDescending(c => c.CreatedAt); break;
                    default: query = asc ? query.OrderBy(c => c.LastName) : query.OrderByDescending(c => c.LastName); break;
                }
            }
            else
            {
                query = query.OrderByDescending(c => c.CreatedAt);
            }

            // 3. Paging
            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            // 4. Projection to Dictionary
            var rows = items.Select(item =>
            {
                var row = new Dictionary<string, object>();
                // Always include ID for linking
                row["Id"] = item.Id; 

                foreach (var col in request.Columns)
                {
                    row[col] = col switch
                    {
                        "FirstName" => item.FirstName,
                        "LastName" => item.LastName,
                        "Email" => item.Email ?? "",
                        "Phone" => item.Phone ?? "",
                        "JobTitle" => item.JobTitle ?? "",
                        "Company" => item.Company?.Name ?? "",
                        "Status" => item.Status ?? "",
                        "ContactSource" => item.ContactSource ?? "",
                        "CreatedAt" => item.CreatedAt.ToString("yyyy-MM-dd"),
                        "City" => item.City ?? "",
                        "State" => item.State ?? "",
                        _ => ""
                    };
                }
                return row;
            }).ToList();

            return new ReportResultDto
            {
                Columns = request.Columns,
                Rows = rows,
                TotalCount = totalCount,
                Page = request.Page,
                PageSize = request.PageSize
            };
        }

        // ===========================================
        // COMPANIES REPORT
        // ===========================================
        private async Task<ReportResultDto> RunCompaniesReport(ReportRunRequestDto request)
        {
            var query = _context.Companies
                .Include(c => c.Contacts)
                .AsQueryable();

            foreach (var filter in request.Filters)
            {
                if (string.IsNullOrWhiteSpace(filter.Value)) continue;
                switch (filter.Field)
                {
                    case "Name": query = ApplyStringFilter(query, c => c.Name, filter); break;
                    case "Industry": query = ApplyStringFilter(query, c => c.Industry, filter); break;
                    case "City": query = ApplyStringFilter(query, c => c.City, filter); break;
                    case "State": query = ApplyStringFilter(query, c => c.State, filter); break;
                    case "Phone": query = ApplyStringFilter(query, c => c.Phone, filter); break;
                    case "CreatedAt": query = ApplyDateFilter(query, c => c.CreatedAt, filter); break;
                }
            }

            if (request.Sorting != null)
            {
                bool asc = request.Sorting.Direction == "asc";
                switch (request.Sorting.Field)
                {
                    case "Name": query = asc ? query.OrderBy(c => c.Name) : query.OrderByDescending(c => c.Name); break;
                    case "Industry": query = asc ? query.OrderBy(c => c.Industry) : query.OrderByDescending(c => c.Industry); break;
                    case "ContactCount": query = asc ? query.OrderBy(c => c.Contacts.Count) : query.OrderByDescending(c => c.Contacts.Count); break;
                    case "CreatedAt": query = asc ? query.OrderBy(c => c.CreatedAt) : query.OrderByDescending(c => c.CreatedAt); break;
                    default: query = query.OrderBy(c => c.Name); break;
                }
            }

            var totalCount = await query.CountAsync();
            var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToListAsync();

            var rows = items.Select(item =>
            {
                var row = new Dictionary<string, object>();
                row["Id"] = item.Id;
                foreach (var col in request.Columns)
                {
                    row[col] = col switch
                    {
                        "Name" => item.Name,
                        "Industry" => item.Industry ?? "",
                        "Website" => item.Website ?? "",
                        "Phone" => item.Phone ?? "",
                        "City" => item.City ?? "",
                        "State" => item.State ?? "",
                        "ContactCount" => item.Contacts?.Count ?? 0,
                        "CreatedAt" => item.CreatedAt.ToString("yyyy-MM-dd"),
                        _ => ""
                    };
                }
                return row;
            }).ToList();

            return new ReportResultDto { Columns = request.Columns, Rows = rows, TotalCount = totalCount, Page = request.Page, PageSize = request.PageSize };
        }

        // ===========================================
        // OPPORTUNITIES REPORT
        // ===========================================
        private async Task<ReportResultDto> RunOpportunitiesReport(ReportRunRequestDto request)
        {
            var query = _context.Opportunities
                .Include(o => o.Contact)
                .Include(o => o.Company)
                .AsQueryable();

            foreach (var filter in request.Filters)
            {
                if (string.IsNullOrWhiteSpace(filter.Value)) continue;
                switch (filter.Field)
                {
                    case "Name": query = ApplyStringFilter(query, c => c.Name, filter); break;
                    case "Stage": query = ApplyStringFilter(query, c => c.Stage, filter); break;
                    case "Type": query = ApplyStringFilter(query, c => c.Type, filter); break;
                    case "Source": query = ApplyStringFilter(query, c => c.Source, filter); break;
                    case "Contact": query = ApplyStringFilter(query, c => c.Contact.FirstName, filter); break; // Simple check
                    case "Company": query = ApplyStringFilter(query, c => c.Company.Name, filter); break;
                    case "Amount": query = ApplyNumberFilter(query, c => c.Amount, filter); break;
                    case "Probability": query = ApplyNumberFilter(query, c => c.Probability, filter); break;
                    case "ExpectedCloseDate": query = ApplyDateFilter(query, c => c.ExpectedCloseDate, filter); break;
                    case "CreatedAt": query = ApplyDateFilter(query, c => c.CreatedAt, filter); break;
                }
            }

            if (request.Sorting != null)
            {
                bool asc = request.Sorting.Direction == "asc";
                switch (request.Sorting.Field)
                {
                    case "Name": query = asc ? query.OrderBy(c => c.Name) : query.OrderByDescending(c => c.Name); break;
                    case "Amount": query = asc ? query.OrderBy(c => c.Amount) : query.OrderByDescending(c => c.Amount); break;
                    case "Stage": query = asc ? query.OrderBy(c => c.Stage) : query.OrderByDescending(c => c.Stage); break;
                    case "ExpectedCloseDate": query = asc ? query.OrderBy(c => c.ExpectedCloseDate) : query.OrderByDescending(c => c.ExpectedCloseDate); break;
                    default: query = query.OrderByDescending(c => c.CreatedAt); break;
                }
            }

            var totalCount = await query.CountAsync();
            var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToListAsync();

            var rows = items.Select(item =>
            {
                var row = new Dictionary<string, object>();
                row["Id"] = item.Id;
                foreach (var col in request.Columns)
                {
                    row[col] = col switch
                    {
                        "Name" => item.Name,
                        "Amount" => item.Amount,
                        "Stage" => item.Stage,
                        "Probability" => item.Probability,
                        "Source" => item.Source ?? "",
                        "Type" => item.Type ?? "",
                        "ExpectedCloseDate" => item.ExpectedCloseDate.ToString("yyyy-MM-dd"),
                        "Contact" => item.Contact != null ? $"{item.Contact.FirstName} {item.Contact.LastName}" : "",
                        "Company" => item.Company?.Name ?? "",
                        "CreatedAt" => item.CreatedAt.ToString("yyyy-MM-dd"),
                        _ => ""
                    };
                }
                return row;
            }).ToList();

            return new ReportResultDto { Columns = request.Columns, Rows = rows, TotalCount = totalCount, Page = request.Page, PageSize = request.PageSize };
        }

        // ===========================================
        // ACTIVITIES REPORT
        // ===========================================
        private async Task<ReportResultDto> RunActivitiesReport(ReportRunRequestDto request)
        {
            var query = _context.Activities
                .Include(a => a.Contact)
                .AsQueryable();

            foreach (var filter in request.Filters)
            {
                if (string.IsNullOrWhiteSpace(filter.Value)) continue;
                switch (filter.Field)
                {
                    case "Subject": query = ApplyStringFilter(query, c => c.Subject, filter); break;
                    case "Type": query = ApplyStringFilter(query, c => c.Type, filter); break;
                    case "Category": query = ApplyStringFilter(query, c => c.Category, filter); break;
                    case "IsCompleted": 
                         if(bool.TryParse(filter.Value, out bool bVal)) query = query.Where(a => a.IsCompleted == bVal);
                         break;
                    case "Contact": query = ApplyStringFilter(query, c => c.Contact.FirstName, filter); break;
                    case "StartTime": query = ApplyDateFilter(query, c => c.StartTime, filter); break;
                    case "CreatedAt": query = ApplyDateFilter(query, c => c.CreatedAt, filter); break;
                }
            }

            if (request.Sorting != null)
            {
                bool asc = request.Sorting.Direction == "asc";
                switch (request.Sorting.Field)
                {
                    case "Subject": query = asc ? query.OrderBy(c => c.Subject) : query.OrderByDescending(c => c.Subject); break;
                    case "StartTime": query = asc ? query.OrderBy(c => c.StartTime) : query.OrderByDescending(c => c.StartTime); break;
                    default: query = query.OrderByDescending(c => c.StartTime); break;
                }
            }

            var totalCount = await query.CountAsync();
            var items = await query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize).ToListAsync();

            var rows = items.Select(item =>
            {
                var row = new Dictionary<string, object>();
                row["Id"] = item.Id;
                foreach (var col in request.Columns)
                {
                    row[col] = col switch
                    {
                        "Subject" => item.Subject,
                        "Type" => item.Type,
                        "Category" => item.Category ?? "",
                        "StartTime" => item.StartTime.ToString("yyyy-MM-dd HH:mm"),
                        "IsCompleted" => item.IsCompleted,
                        "Contact" => item.Contact != null ? $"{item.Contact.FirstName} {item.Contact.LastName}" : "",
                        "CreatedAt" => item.CreatedAt.ToString("yyyy-MM-dd"),
                        _ => ""
                    };
                }
                return row;
            }).ToList();

            return new ReportResultDto { Columns = request.Columns, Rows = rows, TotalCount = totalCount, Page = request.Page, PageSize = request.PageSize };
        }

        // ===========================================
        // HELPERS
        // ===========================================


        // Correct implementation using Expression Trees to support EF Core translation:
        private IQueryable<T> ApplyStringFilter<T>(IQueryable<T> query, Expression<Func<T, string?>> propertySelector, ReportFilterDto filter)
        {
            var parameter = propertySelector.Parameters[0];
            var member = propertySelector.Body;
            
            // Handle null propagation ??
            // EF Core typically handles `c.FirstName` fine.
            
            var value = Expression.Constant(filter.Value);
            Expression body = null;

            switch (filter.Operator)
            {
                case "contains":
                    var containsMethod = typeof(string).GetMethods()
                        .First(m => m.Name == "Contains" && m.GetParameters().Length == 1 && m.GetParameters()[0].ParameterType == typeof(string));
                    body = Expression.Call(member, containsMethod, value);
                    break;
                case "starts_with":
                     var startsWithMethod = typeof(string).GetMethods()
                        .First(m => m.Name == "StartsWith" && m.GetParameters().Length == 1 && m.GetParameters()[0].ParameterType == typeof(string));
                    body = Expression.Call(member, startsWithMethod, value);
                    break;
                case "equals":
                default:
                    body = Expression.Equal(member, value);
                    break;
            }

            var predicate = Expression.Lambda<Func<T, bool>>(body, parameter);
            return query.Where(predicate);
        }

        private IQueryable<T> ApplyNumberFilter<T>(IQueryable<T> query, Expression<Func<T, decimal>> propertySelector, ReportFilterDto filter)
        {
             if (!decimal.TryParse(filter.Value, out var val)) return query;

             var parameter = propertySelector.Parameters[0];
             var member = propertySelector.Body;
             var value = Expression.Constant(val);
             Expression body;

             switch (filter.Operator)
             {
                 case "greater_than": body = Expression.GreaterThan(member, value); break;
                 case "less_than": body = Expression.LessThan(member, value); break;
                 default: body = Expression.Equal(member, value); break;
             }

             return query.Where(Expression.Lambda<Func<T, bool>>(body, parameter));
        }

        // Overload for Int if needed? Or just double/decimal
        private IQueryable<T> ApplyNumberFilter<T>(IQueryable<T> query, Expression<Func<T, int>> propertySelector, ReportFilterDto filter)
        {
             if (!int.TryParse(filter.Value, out var val)) return query;

             var parameter = propertySelector.Parameters[0];
             var member = propertySelector.Body;
             var value = Expression.Constant(val);
             Expression body;
             
             switch (filter.Operator)
             {
                 case "greater_than": body = Expression.GreaterThan(member, value); break;
                 case "less_than": body = Expression.LessThan(member, value); break;
                 default: body = Expression.Equal(member, value); break;
             }
             return query.Where(Expression.Lambda<Func<T, bool>>(body, parameter));
        }

        private IQueryable<T> ApplyNumberFilter<T>(IQueryable<T> query, Expression<Func<T, double>> propertySelector, ReportFilterDto filter)
        {
             if (!double.TryParse(filter.Value, out var val)) return query;

             var parameter = propertySelector.Parameters[0];
             var member = propertySelector.Body;
             var value = Expression.Constant(val);
             Expression body;
             
             switch (filter.Operator)
             {
                 case "greater_than": body = Expression.GreaterThan(member, value); break;
                 case "less_than": body = Expression.LessThan(member, value); break;
                 default: body = Expression.Equal(member, value); break;
             }
             return query.Where(Expression.Lambda<Func<T, bool>>(body, parameter));
        }

        private IQueryable<T> ApplyDateFilter<T>(IQueryable<T> query, Expression<Func<T, DateTime>> propertySelector, ReportFilterDto filter)
        {
             if (!DateTime.TryParse(filter.Value, out var val)) return query;
             // Ensure UTC if needed
             // val = DateTime.SpecifyKind(val, DateTimeKind.Utc);

             var parameter = propertySelector.Parameters[0];
             var member = propertySelector.Body;
             var value = Expression.Constant(val);
             Expression body;
             
             switch (filter.Operator)
             {
                 case "greater_than": body = Expression.GreaterThan(member, value); break;
                 case "less_than": body = Expression.LessThan(member, value); break;
                 default: body = Expression.Equal(member, value); break; // Date equality is fuzzy usually, but stick to exact for now
             }
             return query.Where(Expression.Lambda<Func<T, bool>>(body, parameter));
        }
        
        // Helper to map SavedReport to DTO
        private static SavedReportDto MapToDto(SavedReport r)
        {
            return new SavedReportDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                Category = r.Category,
                ReportType = r.ReportType,
                Columns = r.Columns,
                Filters = r.Filters,
                Sorting = r.Sorting,
                IsPublic = r.IsPublic,
                CreatedByUserId = r.CreatedByUserId,
                CreatedAt = r.CreatedAt,
                LastRunAt = r.LastRunAt
            };
        }
    }
}
