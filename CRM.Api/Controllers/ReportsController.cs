using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;
using CRM.Api.Models.Marketing;
using System.Text;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ReportsController> _logger;

        public ReportsController(ApplicationDbContext context, ILogger<ReportsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // =============================================
        // PIPELINE REPORTS
        // =============================================

        [HttpGet("pipeline")]
        public async Task<ActionResult<object>> GetPipelineReport()
        {
            var data = await _context.Opportunities
                .GroupBy(o => o.Stage)
                .Select(g => new { 
                    Stage = g.Key, 
                    Count = g.Count(), 
                    TotalValue = g.Sum(o => o.Amount)
                })
                .ToListAsync();
            return data;
        }

        [HttpGet("pipeline/summary")]
        public async Task<ActionResult<object>> GetPipelineSummary()
        {
            var opportunities = await _context.Opportunities.ToListAsync();
            
            var openDeals = opportunities.Where(o => o.Stage != "Closed Won" && o.Stage != "Closed Lost");
            var closedWon = opportunities.Where(o => o.Stage == "Closed Won");
            var closedLost = opportunities.Where(o => o.Stage == "Closed Lost");

            return Ok(new
            {
                TotalDeals = opportunities.Count,
                OpenDeals = openDeals.Count(),
                WonDeals = closedWon.Count(),
                LostDeals = closedLost.Count(),
                
                TotalPipelineValue = openDeals.Sum(o => o.Amount),
                WeightedPipelineValue = openDeals.Sum(o => o.Amount * (decimal)(o.Probability / 100.0)),
                WonValue = closedWon.Sum(o => o.Amount),
                LostValue = closedLost.Sum(o => o.Amount),
                
                WinRate = closedWon.Count() + closedLost.Count() > 0
                    ? (double)closedWon.Count() / (closedWon.Count() + closedLost.Count()) * 100
                    : 0,
                AverageDealSize = closedWon.Any() ? closedWon.Average(o => o.Amount) : 0,
                
                ByStage = opportunities.GroupBy(o => o.Stage).Select(g => new {
                    Stage = g.Key,
                    Count = g.Count(),
                    Value = g.Sum(o => o.Amount)
                }).ToList()
            });
        }

        // =============================================
        // ACTIVITY REPORTS
        // =============================================

        [HttpGet("activities")]
        public async Task<ActionResult<object>> GetActivityReport()
        {
            var data = await _context.Activities
                .GroupBy(a => a.Type)
                .Select(g => new { 
                    Type = g.Key, 
                    Count = g.Count(),
                    Completed = g.Count(a => a.IsCompleted)
                })
                .ToListAsync();
            return data;
        }

        [HttpGet("activities/summary")]
        public async Task<ActionResult<object>> GetActivitySummary(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
            var end = endDate ?? DateTime.UtcNow;

            var activities = await _context.Activities
                .Where(a => a.StartTime >= start && a.StartTime <= end)
                .ToListAsync();

            return Ok(new
            {
                TotalActivities = activities.Count,
                Completed = activities.Count(a => a.IsCompleted),
                Pending = activities.Count(a => !a.IsCompleted),
                Overdue = activities.Count(a => !a.IsCompleted && a.EndTime < DateTime.UtcNow),
                CompletionRate = activities.Any() 
                    ? (double)activities.Count(a => a.IsCompleted) / activities.Count * 100 
                    : 0,
                ByType = activities.GroupBy(a => a.Type).Select(g => new {
                    Type = g.Key,
                    Count = g.Count(),
                    Completed = g.Count(a => a.IsCompleted)
                }).ToList(),
                ByCategory = activities
                    .Where(a => !string.IsNullOrWhiteSpace(a.Category))
                    .GroupBy(a => a.Category)
                    .Select(g => new {
                        Category = g.Key,
                        Count = g.Count()
                    }).ToList()
            });
        }

        // =============================================
        // CONTACT REPORTS
        // =============================================

        [HttpGet("contacts")]
        public async Task<ActionResult<object>> GetContactsReport()
        {
            var contacts = await _context.Contacts.Include(c => c.Company).ToListAsync();
            
            return Ok(new
            {
                TotalContacts = contacts.Count,
                WithEmail = contacts.Count(c => !string.IsNullOrWhiteSpace(c.Email)),
                WithPhone = contacts.Count(c => !string.IsNullOrWhiteSpace(c.Phone)),
                WithCompany = contacts.Count(c => c.CompanyId.HasValue),
                
                ByStatus = contacts.GroupBy(c => c.Status ?? "Active").Select(g => new {
                    Status = g.Key,
                    Count = g.Count()
                }).ToList(),
                
                BySource = contacts
                    .Where(c => !string.IsNullOrWhiteSpace(c.ContactSource))
                    .GroupBy(c => c.ContactSource)
                    .Select(g => new { Source = g.Key, Count = g.Count() })
                    .ToList(),
                    
                TopCompanies = contacts
                    .Where(c => c.Company != null)
                    .GroupBy(c => c.Company!.Name)
                    .Select(g => new { Company = g.Key, Count = g.Count() })
                    .OrderByDescending(x => x.Count)
                    .Take(10)
                    .ToList()
            });
        }

        [HttpGet("contacts/growth")]
        public async Task<ActionResult<object>> GetContactsGrowth([FromQuery] int months = 6)
        {
            var startDate = DateTime.UtcNow.AddMonths(-months);
            var data = await _context.Contacts
                .Where(c => c.CreatedAt >= startDate)
                .GroupBy(c => new { c.CreatedAt.Year, c.CreatedAt.Month })
                .Select(g => new { 
                    Year = g.Key.Year, 
                    Month = g.Key.Month, 
                    Count = g.Count() 
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .ToListAsync();
            return data;
        }

        [HttpGet("contacts/list")]
        public async Task<ActionResult<object>> GetContactsList(
            [FromQuery] string? status,
            [FromQuery] int? companyId,
            [FromQuery] string? sortBy = "lastName",
            [FromQuery] string? sortOrder = "asc")
        {
            var query = _context.Contacts.Include(c => c.Company).AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(c => c.Status == status);

            if (companyId.HasValue)
                query = query.Where(c => c.CompanyId == companyId);

            query = sortBy?.ToLower() switch
            {
                "firstname" => sortOrder == "desc" ? query.OrderByDescending(c => c.FirstName) : query.OrderBy(c => c.FirstName),
                "email" => sortOrder == "desc" ? query.OrderByDescending(c => c.Email) : query.OrderBy(c => c.Email),
                "company" => sortOrder == "desc" ? query.OrderByDescending(c => c.Company!.Name) : query.OrderBy(c => c.Company!.Name),
                _ => sortOrder == "desc" ? query.OrderByDescending(c => c.LastName) : query.OrderBy(c => c.LastName)
            };

            var contacts = await query
                .Select(c => new {
                    c.Id,
                    c.FirstName,
                    c.LastName,
                    c.Email,
                    c.Phone,
                    c.JobTitle,
                    c.Status,
                    Company = c.Company != null ? c.Company.Name : null,
                    c.CreatedAt
                })
                .ToListAsync();

            return Ok(contacts);
        }

        // =============================================
        // COMPANY REPORTS
        // =============================================

        [HttpGet("companies")]
        public async Task<ActionResult<object>> GetCompaniesReport()
        {
            var companies = await _context.Companies
                .Include(c => c.Contacts)
                .Include(c => c.Opportunities)
                .ToListAsync();

            return Ok(new
            {
                TotalCompanies = companies.Count,
                WithContacts = companies.Count(c => c.Contacts != null && c.Contacts.Any()),
                WithOpportunities = companies.Count(c => c.Opportunities != null && c.Opportunities.Any()),
                
                TotalContactsAtCompanies = companies.Sum(c => c.Contacts?.Count ?? 0),
                TotalOpportunityValue = companies.Sum(c => c.Opportunities?.Sum(o => o.Amount) ?? 0),
                
                ByIndustry = companies
                    .Where(c => !string.IsNullOrWhiteSpace(c.Industry))
                    .GroupBy(c => c.Industry)
                    .Select(g => new { Industry = g.Key, Count = g.Count() })
                    .OrderByDescending(x => x.Count)
                    .ToList(),
                    
                TopByContacts = companies
                    .Where(c => c.Contacts != null)
                    .OrderByDescending(c => c.Contacts!.Count)
                    .Take(10)
                    .Select(c => new { c.Name, ContactCount = c.Contacts!.Count })
                    .ToList(),
                    
                TopByRevenue = companies
                    .Where(c => c.Opportunities != null && c.Opportunities.Any(o => o.Stage == "Closed Won"))
                    .OrderByDescending(c => c.Opportunities!.Where(o => o.Stage == "Closed Won").Sum(o => o.Amount))
                    .Take(10)
                    .Select(c => new { 
                        c.Name, 
                        Revenue = c.Opportunities!.Where(o => o.Stage == "Closed Won").Sum(o => o.Amount)
                    })
                    .ToList()
            });
        }

        // =============================================
        // OPPORTUNITY REPORTS
        // =============================================

        [HttpGet("opportunities")]
        public async Task<ActionResult<object>> GetOpportunitiesReport()
        {
            var opportunities = await _context.Opportunities
                .Include(o => o.Contact)
                .Include(o => o.Company)
                .ToListAsync();

            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

            return Ok(new
            {
                TotalOpportunities = opportunities.Count,
                Open = opportunities.Count(o => o.Stage != "Closed Won" && o.Stage != "Closed Lost"),
                Won = opportunities.Count(o => o.Stage == "Closed Won"),
                Lost = opportunities.Count(o => o.Stage == "Closed Lost"),
                
                TotalValue = opportunities.Sum(o => o.Amount),
                AverageValue = opportunities.Any() ? opportunities.Average(o => o.Amount) : 0,
                
                WonLast30Days = opportunities.Count(o => o.Stage == "Closed Won" && o.ActualCloseDate >= thirtyDaysAgo),
                WonValueLast30Days = opportunities
                    .Where(o => o.Stage == "Closed Won" && o.ActualCloseDate >= thirtyDaysAgo)
                    .Sum(o => o.Amount),

                BySource = opportunities
                    .Where(o => !string.IsNullOrWhiteSpace(o.Source))
                    .GroupBy(o => o.Source)
                    .Select(g => new { 
                        Source = g.Key, 
                        Count = g.Count(),
                        Value = g.Sum(o => o.Amount),
                        Won = g.Count(o => o.Stage == "Closed Won")
                    })
                    .ToList(),

                ByType = opportunities
                    .Where(o => !string.IsNullOrWhiteSpace(o.Type))
                    .GroupBy(o => o.Type)
                    .Select(g => new { 
                        Type = g.Key, 
                        Count = g.Count(),
                        Value = g.Sum(o => o.Amount)
                    })
                    .ToList()
            });
        }

        [HttpGet("opportunities/forecast")]
        public async Task<ActionResult<object>> GetForecast()
        {
            var opportunities = await _context.Opportunities
                .Where(o => o.Stage != "Closed Won" && o.Stage != "Closed Lost")
                .ToListAsync();

            var thisMonth = DateTime.UtcNow;
            var nextMonth = thisMonth.AddMonths(1);
            var nextQuarter = thisMonth.AddMonths(3);

            return Ok(new
            {
                ThisMonth = new {
                    Count = opportunities.Count(o => o.ExpectedCloseDate.Month == thisMonth.Month && o.ExpectedCloseDate.Year == thisMonth.Year),
                    Value = opportunities.Where(o => o.ExpectedCloseDate.Month == thisMonth.Month && o.ExpectedCloseDate.Year == thisMonth.Year).Sum(o => o.Amount),
                    Weighted = opportunities.Where(o => o.ExpectedCloseDate.Month == thisMonth.Month && o.ExpectedCloseDate.Year == thisMonth.Year).Sum(o => o.WeightedValue)
                },
                NextMonth = new {
                    Count = opportunities.Count(o => o.ExpectedCloseDate.Month == nextMonth.Month && o.ExpectedCloseDate.Year == nextMonth.Year),
                    Value = opportunities.Where(o => o.ExpectedCloseDate.Month == nextMonth.Month && o.ExpectedCloseDate.Year == nextMonth.Year).Sum(o => o.Amount),
                    Weighted = opportunities.Where(o => o.ExpectedCloseDate.Month == nextMonth.Month && o.ExpectedCloseDate.Year == nextMonth.Year).Sum(o => o.WeightedValue)
                },
                NextQuarter = new {
                    Count = opportunities.Count(o => o.ExpectedCloseDate <= nextQuarter),
                    Value = opportunities.Where(o => o.ExpectedCloseDate <= nextQuarter).Sum(o => o.Amount),
                    Weighted = opportunities.Where(o => o.ExpectedCloseDate <= nextQuarter).Sum(o => o.WeightedValue)
                },
                ByForecastCategory = opportunities
                    .GroupBy(o => o.ForecastCategory ?? "Pipeline")
                    .Select(g => new {
                        Category = g.Key,
                        Count = g.Count(),
                        Value = g.Sum(o => o.Amount)
                    })
                    .ToList()
            });
        }

        // =============================================
        // MARKETING REPORTS
        // =============================================

        [HttpGet("marketing")]
        public async Task<ActionResult<object>> GetMarketingReport()
        {
            var campaigns = await _context.MarketingCampaigns.ToListAsync();
            var lists = await _context.MarketingLists.Include(l => l.Members).ToListAsync();

            return Ok(new
            {
                TotalCampaigns = campaigns.Count,
                ActiveCampaigns = campaigns.Count(c => c.Status == "Active"),
                CompletedCampaigns = campaigns.Count(c => c.Status == "Completed"),
                
                TotalEmailsSent = campaigns.Sum(c => c.SentCount),
                TotalOpens = campaigns.Sum(c => c.UniqueOpenCount),
                TotalClicks = campaigns.Sum(c => c.UniqueClickCount),
                TotalBounces = campaigns.Sum(c => c.BounceCount),
                TotalUnsubscribes = campaigns.Sum(c => c.UnsubscribeCount),
                
                AvgOpenRate = campaigns.Any(c => c.SentCount > 0)
                    ? campaigns.Where(c => c.SentCount > 0).Average(c => (double)c.UniqueOpenCount / c.SentCount * 100)
                    : 0,
                AvgClickRate = campaigns.Any(c => c.SentCount > 0)
                    ? campaigns.Where(c => c.SentCount > 0).Average(c => (double)c.UniqueClickCount / c.SentCount * 100)
                    : 0,
                    
                TotalBudget = campaigns.Sum(c => c.Budget ?? 0),
                TotalRevenue = campaigns.Sum(c => c.Revenue ?? 0),
                ROI = campaigns.Sum(c => c.Budget ?? 0) > 0
                    ? (double)(campaigns.Sum(c => c.Revenue ?? 0) - campaigns.Sum(c => c.Budget ?? 0)) / 
                      (double)campaigns.Sum(c => c.Budget ?? 0) * 100
                    : 0,
                    
                TotalLists = lists.Count,
                TotalSubscribers = lists.Sum(l => l.Members?.Count(m => m.Status == "Subscribed") ?? 0),
                
                TopCampaigns = campaigns
                    .OrderByDescending(c => c.UniqueOpenCount)
                    .Take(5)
                    .Select(c => new {
                        c.Name,
                        c.SentCount,
                        c.UniqueOpenCount,
                        OpenRate = c.SentCount > 0 ? (double)c.UniqueOpenCount / c.SentCount * 100 : 0
                    })
                    .ToList()
            });
        }

        // =============================================
        // USER/TEAM REPORTS
        // =============================================

        [HttpGet("users/activity")]
        public async Task<ActionResult<object>> GetUserActivityReport()
        {
            var activities = await _context.Activities.ToListAsync();

            // Group by activity type as a simple user report
            var typeStats = activities
                .GroupBy(a => a.Type)
                .Select(g => new {
                    Type = g.Key,
                    TotalActivities = g.Count(),
                    CompletedActivities = g.Count(a => a.IsCompleted),
                    PendingActivities = g.Count(a => !a.IsCompleted)
                })
                .OrderByDescending(g => g.TotalActivities)
                .ToList();

            return Ok(new
            {
                ActivityStats = typeStats,
                TopActivityTypes = typeStats.Take(10).ToList()
            });
        }

        // =============================================
        // EXPORT ENDPOINTS
        // =============================================

        [HttpGet("export/contacts/csv")]
        public async Task<IActionResult> ExportContactsCsv()
        {
            var contacts = await _context.Contacts
                .Include(c => c.Company)
                .OrderBy(c => c.LastName)
                .ToListAsync();

            var csv = new StringBuilder();
            csv.AppendLine("First Name,Last Name,Email,Phone,Job Title,Company,Status,Created At");
            
            foreach (var c in contacts)
            {
                csv.AppendLine($"\"{c.FirstName}\",\"{c.LastName}\",\"{c.Email}\",\"{c.Phone}\",\"{c.JobTitle}\",\"{c.Company?.Name}\",\"{c.Status}\",\"{c.CreatedAt:yyyy-MM-dd}\"");
            }

            return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", "contacts_export.csv");
        }

        [HttpGet("export/companies/csv")]
        public async Task<IActionResult> ExportCompaniesCsv()
        {
            var companies = await _context.Companies
                .Include(c => c.Contacts)
                .OrderBy(c => c.Name)
                .ToListAsync();

            var csv = new StringBuilder();
            csv.AppendLine("Name,Industry,Website,Phone,Address,City,State,Contact Count,Created At");
            
            foreach (var c in companies)
            {
                csv.AppendLine($"\"{c.Name}\",\"{c.Industry}\",\"{c.Website}\",\"{c.Phone}\",\"{c.Address}\",\"{c.City}\",\"{c.State}\",{c.Contacts?.Count ?? 0},\"{c.CreatedAt:yyyy-MM-dd}\"");
            }

            return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", "companies_export.csv");
        }

        [HttpGet("export/opportunities/csv")]
        public async Task<IActionResult> ExportOpportunitiesCsv()
        {
            var opportunities = await _context.Opportunities
                .Include(o => o.Contact)
                .Include(o => o.Company)
                .OrderByDescending(o => o.Amount)
                .ToListAsync();

            var csv = new StringBuilder();
            csv.AppendLine("Name,Amount,Stage,Probability,Expected Close,Contact,Company,Source,Type,Created At");
            
            foreach (var o in opportunities)
            {
                csv.AppendLine($"\"{o.Name}\",{o.Amount},\"{o.Stage}\",{o.Probability},\"{o.ExpectedCloseDate:yyyy-MM-dd}\",\"{o.Contact?.FirstName} {o.Contact?.LastName}\",\"{o.Company?.Name}\",\"{o.Source}\",\"{o.Type}\",\"{o.CreatedAt:yyyy-MM-dd}\"");
            }

            return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", "opportunities_export.csv");
        }

        [HttpGet("export/activities/csv")]
        public async Task<IActionResult> ExportActivitiesCsv()
        {
            var activities = await _context.Activities
                .Include(a => a.Contact)
                .OrderByDescending(a => a.StartTime)
                .ToListAsync();

            var csv = new StringBuilder();
            csv.AppendLine("Subject,Type,Category,Start Time,Is Completed,Contact,Notes,Created At");
            
            foreach (var a in activities)
            {
                csv.AppendLine($"\"{a.Subject}\",\"{a.Type}\",\"{a.Category}\",\"{a.StartTime:yyyy-MM-dd}\",{a.IsCompleted},\"{a.Contact?.FirstName} {a.Contact?.LastName}\",\"{a.Notes?.Replace("\"", "\"\"")}\",\"{a.CreatedAt:yyyy-MM-dd}\"");
            }

            return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", "activities_export.csv");
        }

        // =============================================
        // DASHBOARD SUMMARY
        // =============================================

        [HttpGet("dashboard")]
        public async Task<ActionResult<object>> GetDashboardSummary()
        {
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            
            var contacts = await _context.Contacts.ToListAsync();
            var companies = await _context.Companies.ToListAsync();
            var opportunities = await _context.Opportunities.ToListAsync();
            var activities = await _context.Activities.ToListAsync();

            return Ok(new
            {
                Contacts = new {
                    Total = contacts.Count,
                    NewThisMonth = contacts.Count(c => c.CreatedAt >= thirtyDaysAgo)
                },
                Companies = new {
                    Total = companies.Count,
                    NewThisMonth = companies.Count(c => c.CreatedAt >= thirtyDaysAgo)
                },
                Opportunities = new {
                    Total = opportunities.Count,
                    Open = opportunities.Count(o => o.Stage != "Closed Won" && o.Stage != "Closed Lost"),
                    WonThisMonth = opportunities.Count(o => o.Stage == "Closed Won" && o.ActualCloseDate >= thirtyDaysAgo),
                    PipelineValue = opportunities.Where(o => o.Stage != "Closed Won" && o.Stage != "Closed Lost").Sum(o => o.Amount)
                },
                Activities = new {
                    Total = activities.Count,
                    CompletedThisMonth = activities.Count(a => a.IsCompleted && a.CompletedAt >= thirtyDaysAgo),
                    Overdue = activities.Count(a => !a.IsCompleted && a.EndTime < DateTime.UtcNow)
                }
            });
        }
    }
}
