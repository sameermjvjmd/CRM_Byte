using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CompaniesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CompaniesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/companies
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Company>>> GetCompanies([FromQuery] string? search)
        {
            var query = _context.Companies
                .Include(c => c.ParentCompany)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.ToLower();
                query = query.Where(c => 
                    c.Name.ToLower().Contains(term) || 
                    (c.Industry != null && c.Industry.ToLower().Contains(term)) ||
                    (c.City != null && c.City.ToLower().Contains(term)) ||
                    (c.Website != null && c.Website.ToLower().Contains(term))
                );
            }

            return await query.OrderBy(c => c.Name).ToListAsync();
        }

        // GET: api/companies/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Company>> GetCompany(int id)
        {
            var company = await _context.Companies
                .Include(c => c.Contacts)
                .Include(c => c.Opportunities)
                .Include(c => c.ParentCompany)
                .Include(c => c.Subsidiaries)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (company == null) return NotFound();

            return company;
        }

        // GET: api/companies/5/contacts
        [HttpGet("{id}/contacts")]
        public async Task<ActionResult<IEnumerable<Contact>>> GetCompanyContacts(int id)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null) return NotFound();

            var contacts = await _context.Contacts
                .Where(c => c.CompanyId == id)
                .OrderBy(c => c.LastName)
                .ThenBy(c => c.FirstName)
                .ToListAsync();

            return contacts;
        }

        // GET: api/companies/5/opportunities
        [HttpGet("{id}/opportunities")]
        public async Task<ActionResult<IEnumerable<Opportunity>>> GetCompanyOpportunities(int id)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null) return NotFound();

            // Get opportunities linked to contacts in this company
            var contactIds = await _context.Contacts
                .Where(c => c.CompanyId == id)
                .Select(c => c.Id)
                .ToListAsync();

            var opportunities = await _context.Opportunities
                .Where(o => o.ContactId.HasValue && contactIds.Contains(o.ContactId.Value))
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return opportunities;
        }

        // GET: api/companies/5/activities
        [HttpGet("{id}/activities")]
        public async Task<ActionResult<IEnumerable<Activity>>> GetCompanyActivities(int id)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null) return NotFound();

            // Get activities for all contacts in this company
            var contactIds = await _context.Contacts
                .Where(c => c.CompanyId == id)
                .Select(c => c.Id)
                .ToListAsync();

            var activities = await _context.Activities
                .Where(a => a.ContactId.HasValue && contactIds.Contains(a.ContactId.Value))
                .OrderByDescending(a => a.StartTime)
                .Take(50)
                .ToListAsync();

            return activities;
        }

        // GET: api/companies/5/history
        [HttpGet("{id}/history")]
        public async Task<ActionResult<IEnumerable<HistoryItem>>> GetCompanyHistory(int id)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null) return NotFound();

            // Get history for all contacts in this company
            var contactIds = await _context.Contacts
                .Where(c => c.CompanyId == id)
                .Select(c => c.Id)
                .ToListAsync();

            var history = await _context.HistoryItems
                .Where(h => h.ContactId.HasValue && contactIds.Contains(h.ContactId.Value))
                .OrderByDescending(h => h.Date)
                .Take(100)
                .ToListAsync();

            return history;
        }

        // GET: api/companies/5/subsidiaries
        [HttpGet("{id}/subsidiaries")]
        public async Task<ActionResult<IEnumerable<Company>>> GetSubsidiaries(int id)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null) return NotFound();

            var subsidiaries = await _context.Companies
                .Where(c => c.ParentCompanyId == id)
                .OrderBy(c => c.Name)
                .ToListAsync();

            return subsidiaries;
        }

        // POST: api/companies
        [HttpPost]
        public async Task<ActionResult<Company>> PostCompany(Company company)
        {
            company.CreatedAt = DateTime.UtcNow;
            company.LastModifiedAt = DateTime.UtcNow;
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCompany), new { id = company.Id }, company);
        }

        // PUT: api/companies/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCompany(int id, Company company)
        {
            if (id != company.Id) return BadRequest();

            // Prevent circular parent reference
            if (company.ParentCompanyId == company.Id)
            {
                return BadRequest("A company cannot be its own parent.");
            }

            company.LastModifiedAt = DateTime.UtcNow;
            _context.Entry(company).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CompanyExists(id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // DELETE: api/companies/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCompany(int id)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null) return NotFound();

            // Check for linked contacts
            var hasContacts = await _context.Contacts.AnyAsync(c => c.CompanyId == id);
            if (hasContacts)
            {
                return BadRequest("Cannot delete company with linked contacts. Please unlink or delete the contacts first.");
            }

            // Check for subsidiaries
            var hasSubsidiaries = await _context.Companies.AnyAsync(c => c.ParentCompanyId == id);
            if (hasSubsidiaries)
            {
                return BadRequest("Cannot delete company with subsidiaries. Please delete or reassign subsidiaries first.");
            }

            _context.Companies.Remove(company);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CompanyExists(int id)
        {
            return _context.Companies.Any(e => e.Id == id);
        }
    }
}
