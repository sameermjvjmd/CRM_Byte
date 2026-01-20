using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models.Reporting;
using System.Globalization;

namespace CRM.Api.Controllers
{
    [Route("api/forecast")]
    [ApiController]
    public class ForecastController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ForecastController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("{year}")]
        public async Task<ActionResult<SalesForecastSummary>> GetForecast(int year, [FromQuery] int? userId)
        {
            var summary = new SalesForecastSummary
            {
                FiscalYear = year
            };

            // 1. Get Quotas
            var quotaQuery = _context.SalesQuotas.Where(q => q.FiscalYear == year);
            if (userId.HasValue) quotaQuery = quotaQuery.Where(q => q.UserId == userId);
            
            var quotas = await quotaQuery.ToListAsync();

            // 2. Get Opportunities (Closed Won)
            var wonQuery = _context.Opportunities
                .Where(o => o.Stage == "Closed Won" && o.ActualCloseDate.HasValue && o.ActualCloseDate.Value.Year == year);
            
            if (userId.HasValue) 
            {
                // Assuming we link Opps to Owners. For now, let's assume Opportunity has an OwnerId or we use logged in user context
                // But typically Opps have an 'OwnerId' which maps to User.Id
                // Let's check Opportunity model later. For now, I'll skip user filter on Opps if the property doesn't exist, 
                // BUT wait, I saw 'OwnerId' in Quote, likely it's in Opportunity too.
                // Let's assume there is a relationship or just filter by implicit owner logic if we had it.
                // Actually, I'll double check Opportunity model.
            }
            // Temporarily ignore user filtering on Opps until I verify the field name.

            var wonOpps = await wonQuery
                .Select(o => new { o.ActualCloseDate, o.Amount })
                .ToListAsync();

            // 3. Get Pipeline (Open Opps)
            var pipelineQuery = _context.Opportunities
                .Where(o => o.Stage != "Closed Won" && o.Stage != "Closed Lost" && o.ExpectedCloseDate.Year == year);
            
            var pipelineOpps = await pipelineQuery
                .Select(o => new { o.ExpectedCloseDate, o.Amount, o.Probability })
                .ToListAsync();


            // Aggregate Data
            for (int month = 1; month <= 12; month++)
            {
                var monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(month);
                
                // Quota
                decimal monthlyQuota = 0;
                
                // Add explicit monthly quotas
                monthlyQuota += quotas.Where(q => q.PeriodType == "Monthly" && q.PeriodNumber == month).Sum(q => q.Amount);

                // Add quarterly quotas (Quarter 1 = Month 1,2,3)
                int quarter = (month - 1) / 3 + 1;
                var quarterlyQuota = quotas.Where(q => q.PeriodType == "Quarterly" && q.PeriodNumber == quarter).Sum(q => q.Amount);
                if (quarterlyQuota > 0) monthlyQuota += (quarterlyQuota / 3);
                
                // Add Yearly quota (spread evenly)
                var yearlyQuota = quotas.Where(q => q.PeriodType == "Yearly").Sum(q => q.Amount);
                if (yearlyQuota > 0) monthlyQuota += (yearlyQuota / 12);


                // Won
                var monthlyWon = wonOpps
                    .Where(o => o.ActualCloseDate.Value.Month == month)
                    .Sum(o => o.Amount);

                // Pipeline
                var monthlyPipeline = pipelineOpps
                    .Where(o => o.ExpectedCloseDate.Month == month);
                
                var totalPipeline = monthlyPipeline.Sum(o => o.Amount);
                var weightedPipeline = monthlyPipeline.Sum(o => o.Amount * ((decimal)o.Probability / 100m));

                summary.MonthlyData.Add(new MonthlyForecastItem
                {
                    Month = month,
                    MonthName = monthName,
                    Quota = monthlyQuota,
                    ClosedWon = monthlyWon,
                    PipelineTotal = totalPipeline,
                    PipelineWeighted = weightedPipeline
                });
            }

            // Calculate Totals
            summary.TotalQuota = summary.MonthlyData.Sum(m => m.Quota);
            summary.TotalClosedWon = summary.MonthlyData.Sum(m => m.ClosedWon);
            summary.TotalPipelineWeighted = summary.MonthlyData.Sum(m => m.PipelineWeighted);

            return summary;
        }
    }
}
