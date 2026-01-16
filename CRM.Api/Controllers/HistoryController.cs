using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HistoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public HistoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<HistoryItem>>> GetHistory()
        {
            return await _context.HistoryItems
                .Include(h => h.Contact)
                .OrderByDescending(h => h.Date)
                .ToListAsync();
        }

        [HttpGet("contact/{contactId}")]
        public async Task<ActionResult<IEnumerable<HistoryItem>>> GetHistoryByContact(int contactId)
        {
            return await _context.HistoryItems
                .Where(h => h.ContactId == contactId)
                .OrderByDescending(h => h.Date)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<HistoryItem>> CreateHistory(HistoryItem history)
        {
            // If date is default, set to now
            if (history.Date == default) history.Date = DateTime.UtcNow;
            
            _context.HistoryItems.Add(history);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetHistory), new { id = history.Id }, history);
        }
    }
}
