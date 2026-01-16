using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalContacts = await _context.Contacts.CountAsync();
            var openOpps = await _context.Opportunities.CountAsync(o => o.Stage != "Closed Won" && o.Stage != "Closed Lost");
            var totalValue = await _context.Opportunities
                .Where(o => o.Stage != "Closed Won" && o.Stage != "Closed Lost")
                .SumAsync(o => o.Amount);
            
            var winRate = 0.0;
            var closedOpps = await _context.Opportunities.CountAsync(o => o.Stage == "Closed Won" || o.Stage == "Closed Lost");
            if (closedOpps > 0)
            {
                var wonOpps = await _context.Opportunities.CountAsync(o => o.Stage == "Closed Won");
                winRate = (double)wonOpps / closedOpps * 100;
            }

            // Funnel data
            var funnel = new[]
            {
                new { Label = "Initial", Count = await _context.Opportunities.CountAsync(o => o.Stage == "Initial") },
                new { Label = "Qualification", Count = await _context.Opportunities.CountAsync(o => o.Stage == "Qualification") },
                new { Label = "Proposal", Count = await _context.Opportunities.CountAsync(o => o.Stage == "Proposal") },
                new { Label = "Negotiation", Count = await _context.Opportunities.CountAsync(o => o.Stage == "Negotiation") },
                new { Label = "Closed Won", Count = await _context.Opportunities.CountAsync(o => o.Stage == "Closed Won") }
            };

            // Calculate percentages based on "Initial" (top of funnel) or total
            var topCount = await _context.Opportunities.CountAsync();
            var funnelData = funnel.Select(f => new {
                f.Label,
                Percentage = topCount > 0 ? (int)((double)f.Count / topCount * 100) : 0
            }).ToList();

            // Recent activities
            var recentActivities = await _context.Activities
                .OrderByDescending(a => a.CreatedAt)
                .Take(5)
                .Select(a => new {
                    Id = a.Id,
                    Title = a.Subject,
                    Time = a.CreatedAt,
                    Type = a.Type
                })
                .ToListAsync();

            return Ok(new
            {
                TotalContacts = totalContacts,
                OpenOpportunities = openOpps,
                PotentialValue = totalValue,
                WinRate = Math.Round(winRate, 1),
                Funnel = funnelData,
                RecentActivities = recentActivities
            });
        }
    }
}
