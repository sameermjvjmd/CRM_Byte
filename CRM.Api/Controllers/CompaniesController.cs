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

            // Populate Custom Fields
            company.CustomValues = await _context.CustomFieldValues
                .Include(v => v.CustomFieldDefinition)
                .Where(v => v.EntityId == id && v.EntityType == "Company")
                .ToListAsync();

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
            
            // Handle Custom Values for Create
             if (company.CustomValues != null && company.CustomValues.Any())
            {
                foreach (var field in company.CustomValues)
                {
                    field.EntityId = company.Id;
                    field.EntityType = "Company";
                    field.UpdatedAt = DateTime.UtcNow;
                    field.CustomFieldDefinition = null; 
                    _context.CustomFieldValues.Add(field);
                }
                await _context.SaveChangesAsync();
            }

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
            
             // Handle Custom Values Update
            if (company.CustomValues != null)
            {
                foreach (var val in company.CustomValues)
                {
                    var existing = await _context.CustomFieldValues
                        .FirstOrDefaultAsync(v => v.EntityId == id && v.EntityType == "Company" && v.CustomFieldDefinitionId == val.CustomFieldDefinitionId);
                        
                    if (existing != null)
                    {
                        existing.Value = val.Value;
                        existing.UpdatedAt = DateTime.UtcNow;
                        _context.Entry(existing).State = EntityState.Modified;
                    }
                    else
                    {
                        val.EntityId = id;
                        val.EntityType = "Company";
                        val.UpdatedAt = DateTime.UtcNow;
                        val.CustomFieldDefinition = null!;
                        _context.CustomFieldValues.Add(val);
                    }
                }
            }

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

        // POST: api/companies/search
        [HttpPost("search")]
        public async Task<ActionResult<IEnumerable<Company>>> SearchCompanies(DTOs.AdvancedSearchRequestDto request)
        {
            var query = _context.Companies.AsQueryable();

            if (request.Criteria == null || !request.Criteria.Any())
            {
                return await query.OrderBy(c => c.Name).ToListAsync();
            }

            if (request.MatchType == "Any")
            {
                var combinedResults = new List<Company>();
                foreach (var criteria in request.Criteria)
                {
                    var fieldQuery = _context.Companies.AsQueryable();
                    fieldQuery = ApplyCriteria(fieldQuery, criteria);
                    combinedResults.AddRange(await fieldQuery.ToListAsync());
                }
                return combinedResults.DistinctBy(c => c.Id).OrderBy(c => c.Name).ToList();
            }
            else
            {
                foreach (var criteria in request.Criteria)
                {
                    query = ApplyCriteria(query, criteria);
                }
                return await query.OrderBy(c => c.Name).ToListAsync();
            }
        }

        private IQueryable<Company> ApplyCriteria(IQueryable<Company> query, DTOs.SearchCriteriaDto criteria)
        {
            var field = criteria.Field.ToLower();
            var op = criteria.Operator;
            var val = criteria.Value.ToLower();

            if (string.IsNullOrEmpty(val)) return query;

            switch (field)
            {
                case "name":
                case "company":
                    if (op == "Contains") return query.Where(c => c.Name.ToLower().Contains(val));
                    else if (op == "Equals") return query.Where(c => c.Name.ToLower() == val);
                    else if (op == "Starts With") return query.Where(c => c.Name.ToLower().StartsWith(val));
                    break;
                case "industry":
                    if (op == "Contains") return query.Where(c => c.Industry != null && c.Industry.ToLower().Contains(val));
                    else if (op == "Equals") return query.Where(c => c.Industry != null && c.Industry.ToLower() == val);
                    break;
                case "city":
                    if (op == "Contains") return query.Where(c => c.City != null && c.City.ToLower().Contains(val));
                    break;
                case "state":
                    if (op == "Contains") return query.Where(c => c.State != null && c.State.ToLower().Contains(val));
                    break;
                case "phone":
                    if (op == "Contains") return query.Where(c => c.Phone != null && c.Phone.Contains(val)); // Phone case sensitive usually? or simple contains
                    break;
                case "website":
                    if (op == "Contains") return query.Where(c => c.Website != null && c.Website.ToLower().Contains(val));
                    break;
            }
            return query;
        }

        private bool CompanyExists(int id)
        {
            return _context.Companies.Any(e => e.Id == id);
        }
    }
}
