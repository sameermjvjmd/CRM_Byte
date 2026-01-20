using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;

namespace CRM.Api.Controllers
{
    [Route("api/quote-templates")]
    [ApiController]
    public class QuoteTemplatesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public QuoteTemplatesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<QuoteTemplate>>> GetQuoteTemplates()
        {
            return await _context.QuoteTemplates.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<QuoteTemplate>> GetQuoteTemplate(int id)
        {
            var template = await _context.QuoteTemplates.FindAsync(id);

            if (template == null)
            {
                return NotFound();
            }

            return template;
        }

        // GET: api/quote-templates/default
        [HttpGet("default")]
        public async Task<ActionResult<QuoteTemplate>> GetDefaultTemplate()
        {
            var template = await _context.QuoteTemplates.FirstOrDefaultAsync(t => t.IsDefault);
            if (template == null)
            {
                // Create a transient default if none exists, don't save to DB yet
                return new QuoteTemplate();
            }
            return template;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutQuoteTemplate(int id, QuoteTemplate quoteTemplate)
        {
            if (id != quoteTemplate.Id)
            {
                return BadRequest();
            }

            // If setting as default, unset others
            if (quoteTemplate.IsDefault)
            {
                var others = await _context.QuoteTemplates.Where(t => t.Id != id && t.IsDefault).ToListAsync();
                foreach (var t in others) 
                {
                    t.IsDefault = false;
                    _context.Entry(t).State = EntityState.Modified;
                }
            }

            _context.Entry(quoteTemplate).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!QuoteTemplateExists(id))
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

        [HttpPost]
        public async Task<ActionResult<QuoteTemplate>> PostQuoteTemplate(QuoteTemplate quoteTemplate)
        {
            if (quoteTemplate.IsDefault)
            {
                var others = await _context.QuoteTemplates.Where(t => t.IsDefault).ToListAsync();
                foreach (var t in others) 
                {
                    t.IsDefault = false;
                    _context.Entry(t).State = EntityState.Modified;
                }
            }

            _context.QuoteTemplates.Add(quoteTemplate);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetQuoteTemplate", new { id = quoteTemplate.Id }, quoteTemplate);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuoteTemplate(int id)
        {
            var quoteTemplate = await _context.QuoteTemplates.FindAsync(id);
            if (quoteTemplate == null)
            {
                return NotFound();
            }

            _context.QuoteTemplates.Remove(quoteTemplate);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool QuoteTemplateExists(int id)
        {
            return _context.QuoteTemplates.Any(e => e.Id == id);
        }
    }
}
