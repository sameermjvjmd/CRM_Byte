using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;

namespace CRM.Api.Controllers
{
    [Route("api/sales-quotas")]
    [ApiController]
    public class SalesQuotasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SalesQuotasController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/sales-quotas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SalesQuota>>> GetSalesQuotas(
            [FromQuery] int? userId, 
            [FromQuery] int? year)
        {
            var query = _context.SalesQuotas.Include(q => q.User).AsQueryable();

            if (userId.HasValue)
            {
                query = query.Where(q => q.UserId == userId);
            }

            if (year.HasValue)
            {
                query = query.Where(q => q.FiscalYear == year);
            }

            return await query.OrderBy(q => q.FiscalYear).ThenBy(q => q.PeriodNumber).ToListAsync();
        }

        // GET: api/sales-quotas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SalesQuota>> GetSalesQuota(int id)
        {
            var salesQuota = await _context.SalesQuotas.FindAsync(id);

            if (salesQuota == null)
            {
                return NotFound();
            }

            return salesQuota;
        }

        // POST: api/sales-quotas
        [HttpPost]
        public async Task<ActionResult<SalesQuota>> PostSalesQuota(SalesQuota salesQuota)
        {
            // Set dates based on period and year if not provided correctly
            if (salesQuota.PeriodType == "Monthly")
            {
                salesQuota.StartDate = new DateTime(salesQuota.FiscalYear, salesQuota.PeriodNumber, 1);
                salesQuota.EndDate = salesQuota.StartDate.AddMonths(1).AddDays(-1);
            }
            // Add other logic for Quarterly if needed, for now assuming Monthly is primary

            _context.SalesQuotas.Add(salesQuota);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSalesQuota", new { id = salesQuota.Id }, salesQuota);
        }

        // POST: api/sales-quotas/bulk
        [HttpPost("bulk")]
        public async Task<ActionResult<IEnumerable<SalesQuota>>> PostBulkQuotas(List<SalesQuota> quotas)
        {
            foreach (var quota in quotas)
            {
                // Check if quota exists for this user/period
                var existing = await _context.SalesQuotas
                    .FirstOrDefaultAsync(q => q.UserId == quota.UserId && 
                                            q.FiscalYear == quota.FiscalYear && 
                                            q.PeriodNumber == quota.PeriodNumber);

                if (existing != null)
                {
                    existing.Amount = quota.Amount;
                    existing.LastModifiedAt = DateTime.UtcNow;
                    _context.Entry(existing).State = EntityState.Modified;
                }
                else
                {
                    if (quota.PeriodType == "Monthly")
                    {
                        quota.StartDate = new DateTime(quota.FiscalYear, quota.PeriodNumber, 1);
                        quota.EndDate = quota.StartDate.AddMonths(1).AddDays(-1);
                    }
                    quota.CreatedAt = DateTime.UtcNow;
                    quota.LastModifiedAt = DateTime.UtcNow;
                    _context.SalesQuotas.Add(quota);
                }
            }

            await _context.SaveChangesAsync();
            return Ok(quotas);
        }

        // PUT: api/sales-quotas/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSalesQuota(int id, SalesQuota salesQuota)
        {
            if (id != salesQuota.Id)
            {
                return BadRequest();
            }

            _context.Entry(salesQuota).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SalesQuotaExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/sales-quotas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSalesQuota(int id)
        {
            var salesQuota = await _context.SalesQuotas.FindAsync(id);
            if (salesQuota == null)
            {
                return NotFound();
            }

            _context.SalesQuotas.Remove(salesQuota);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SalesQuotaExists(int id)
        {
            return _context.SalesQuotas.Any(e => e.Id == id);
        }
    }
}
