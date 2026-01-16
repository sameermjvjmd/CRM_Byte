using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PipelineAnalyticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PipelineAnalyticsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get overall pipeline statistics
        /// </summary>
        [HttpGet("stats")]
        public async Task<ActionResult<PipelineStatsDto>> GetPipelineStats()
        {
            var opportunities = await _context.Opportunities.ToListAsync();

            var totalDeals = opportunities.Count;
            var totalValue = opportunities.Sum(o => o.Amount);
            var weightedValue = opportunities.Sum(o => o.Amount * ((decimal)o.Probability / 100));
            var avgDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;
            
            var closedWon = opportunities.Where(o => o.Stage == "Closed Won").ToList();
            var closedLost = opportunities.Where(o => o.Stage == "Closed Lost").ToList();
            var openDeals = opportunities.Where(o => o.Stage != "Closed Won" && o.Stage != "Closed Lost").ToList();
            
            var winRate = (closedWon.Count + closedLost.Count) > 0 
                ? (double)closedWon.Count / (closedWon.Count + closedLost.Count) * 100 
                : 0;

            return new PipelineStatsDto
            {
                TotalDeals = totalDeals,
                OpenDeals = openDeals.Count,
                ClosedWonDeals = closedWon.Count,
                ClosedLostDeals = closedLost.Count,
                TotalValue = totalValue,
                WeightedValue = weightedValue,
                OpenValue = openDeals.Sum(o => o.Amount),
                WonValue = closedWon.Sum(o => o.Amount),
                LostValue = closedLost.Sum(o => o.Amount),
                AverageDealSize = avgDealSize,
                WinRate = Math.Round(winRate, 1)
            };
        }

        /// <summary>
        /// Get pipeline breakdown by stage
        /// </summary>
        [HttpGet("by-stage")]
        public async Task<ActionResult<List<StageBreakdownDto>>> GetByStage()
        {
            var opportunities = await _context.Opportunities.ToListAsync();

            var stages = new[] { "Lead", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost" };
            var legacyMapping = new Dictionary<string, string>
            {
                { "Initial", "Lead" },
                { "Qualification", "Qualified" }
            };

            var result = stages.Select(stage => {
                var stageOpps = opportunities.Where(o => {
                    var mappedStage = legacyMapping.ContainsKey(o.Stage) ? legacyMapping[o.Stage] : o.Stage;
                    return mappedStage == stage;
                }).ToList();

                return new StageBreakdownDto
                {
                    Stage = stage,
                    Count = stageOpps.Count,
                    Value = stageOpps.Sum(o => o.Amount),
                    WeightedValue = stageOpps.Sum(o => o.Amount * ((decimal)o.Probability / 100)),
                    AverageProbability = stageOpps.Count > 0 ? stageOpps.Average(o => o.Probability) : 0
                };
            }).ToList();

            return result;
        }

        /// <summary>
        /// Get stage history/conversion data
        /// </summary>
        [HttpGet("conversions")]
        public async Task<ActionResult<List<StageConversionDto>>> GetConversions()
        {
            var history = await _context.StageHistories
                .OrderByDescending(h => h.ChangedAt)
                .Take(100)
                .ToListAsync();

            var conversions = history
                .GroupBy(h => new { h.FromStage, h.ToStage })
                .Select(g => new StageConversionDto
                {
                    FromStage = g.Key.FromStage,
                    ToStage = g.Key.ToStage,
                    Count = g.Count(),
                    AverageDaysInStage = g.Average(h => h.DaysInPreviousStage)
                })
                .OrderByDescending(c => c.Count)
                .ToList();

            return conversions;
        }

        /// <summary>
        /// Get sales forecast for upcoming months
        /// </summary>
        [HttpGet("forecast")]
        public async Task<ActionResult<List<ForecastDto>>> GetForecast()
        {
            var opportunities = await _context.Opportunities
                .Where(o => o.Stage != "Closed Won" && o.Stage != "Closed Lost")
                .ToListAsync();

            // Group by expected close month
            var forecast = opportunities
                .GroupBy(o => new { o.ExpectedCloseDate.Year, o.ExpectedCloseDate.Month })
                .Select(g => new ForecastDto
                {
                    Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                    MonthName = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                    DealCount = g.Count(),
                    TotalValue = g.Sum(o => o.Amount),
                    WeightedValue = g.Sum(o => o.Amount * ((decimal)o.Probability / 100))
                })
                .OrderBy(f => f.Month)
                .Take(6) // Next 6 months
                .ToList();

            return forecast;
        }

        /// <summary>
        /// Get sales velocity metrics (average days per stage, sales cycle length)
        /// </summary>
        [HttpGet("velocity")]
        public async Task<ActionResult<VelocityDto>> GetVelocity()
        {
            // Get closed won deals with stage history
            var wonDeals = await _context.Opportunities
                .Where(o => o.Stage == "Closed Won" && o.TotalDaysToClose > 0)
                .ToListAsync();

            // Get stage history for average days calculation
            var stageHistory = await _context.StageHistories
                .Where(h => h.DaysInPreviousStage > 0)
                .ToListAsync();

            // Calculate average days per stage
            var avgDaysPerStage = new Dictionary<string, double>();
            var stages = new[] { "Lead", "Qualified", "Proposal", "Negotiation" };
            foreach (var stage in stages)
            {
                var daysInStage = stageHistory
                    .Where(h => h.FromStage == stage)
                    .Select(h => h.DaysInPreviousStage)
                    .ToList();
                
                avgDaysPerStage[stage] = daysInStage.Count > 0 ? daysInStage.Average() : 0;
            }

            // Calculate overall metrics
            var avgSalesCycle = wonDeals.Count > 0 ? wonDeals.Average(o => o.TotalDaysToClose) : 0;
            var fastestDeal = wonDeals.Count > 0 ? wonDeals.Min(o => o.TotalDaysToClose) : 0;
            var slowestDeal = wonDeals.Count > 0 ? wonDeals.Max(o => o.TotalDaysToClose) : 0;

            // Win velocity (deals closed per month)
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            var recentWins = await _context.Opportunities
                .Where(o => o.Stage == "Closed Won" && o.WonDate >= thirtyDaysAgo)
                .CountAsync();

            return new VelocityDto
            {
                AverageSalesCycleDays = Math.Round(avgSalesCycle, 1),
                FastestDealDays = fastestDeal,
                SlowestDealDays = slowestDeal,
                DealsClosedLast30Days = recentWins,
                AverageDaysPerStage = avgDaysPerStage.Select(kvp => new StageVelocityDto 
                { 
                    Stage = kvp.Key, 
                    AverageDays = Math.Round(kvp.Value, 1) 
                }).ToList()
            };
        }
    }

    // DTOs
    public class PipelineStatsDto
    {
        public int TotalDeals { get; set; }
        public int OpenDeals { get; set; }
        public int ClosedWonDeals { get; set; }
        public int ClosedLostDeals { get; set; }
        public decimal TotalValue { get; set; }
        public decimal WeightedValue { get; set; }
        public decimal OpenValue { get; set; }
        public decimal WonValue { get; set; }
        public decimal LostValue { get; set; }
        public decimal AverageDealSize { get; set; }
        public double WinRate { get; set; }
    }

    public class StageBreakdownDto
    {
        public string Stage { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Value { get; set; }
        public decimal WeightedValue { get; set; }
        public double AverageProbability { get; set; }
    }

    public class StageConversionDto
    {
        public string FromStage { get; set; } = string.Empty;
        public string ToStage { get; set; } = string.Empty;
        public int Count { get; set; }
        public double AverageDaysInStage { get; set; }
    }

    public class ForecastDto
    {
        public string Month { get; set; } = string.Empty;
        public string MonthName { get; set; } = string.Empty;
        public int DealCount { get; set; }
        public decimal TotalValue { get; set; }
        public decimal WeightedValue { get; set; }
    }

    public class VelocityDto
    {
        public double AverageSalesCycleDays { get; set; }
        public int FastestDealDays { get; set; }
        public int SlowestDealDays { get; set; }
        public int DealsClosedLast30Days { get; set; }
        public List<StageVelocityDto> AverageDaysPerStage { get; set; } = new();
    }

    public class StageVelocityDto
    {
        public string Stage { get; set; } = string.Empty;
        public double AverageDays { get; set; }
    }
}
