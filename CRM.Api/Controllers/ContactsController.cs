using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;
using CRM.Api.DTOs;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ContactsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/contacts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Contact>>> GetContacts([FromQuery] string? search)
        {
            var query = _context.Contacts
                .Include(c => c.Company)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.ToLower();
                query = query.Where(c => 
                    c.FirstName.ToLower().Contains(term) || 
                    c.LastName.ToLower().Contains(term) || 
                    c.Email.ToLower().Contains(term) || 
                    c.Phone.Contains(term) ||
                    (c.Company != null && c.Company.Name.ToLower().Contains(term))
                );
            }

            return await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
        }

        // GET: api/contacts/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Contact>> GetContact(int id)
        {
            var contact = await _context.Contacts
                .Include(c => c.Groups)
                .Include(c => c.Company)
                .Include(c => c.ContactEmails.OrderBy(e => e.SortOrder))
                .Include(c => c.ContactAddresses.OrderBy(a => a.SortOrder))
                .FirstOrDefaultAsync(c => c.Id == id);

            if (contact == null)
            {
                return NotFound();
            }

            // Populate Custom Fields
            contact.CustomValues = await _context.CustomFieldValues
                .Include(v => v.CustomFieldDefinition)
                .Where(v => v.EntityId == id && v.EntityType == "Contact")
                .ToListAsync();

            return contact;
        }

        // POST: api/contacts
        [HttpPost]
        public async Task<ActionResult<Contact>> PostContact(Contact contact)
        {
            contact.CreatedAt = DateTime.UtcNow;
            contact.LastModifiedAt = DateTime.UtcNow;
            _context.Contacts.Add(contact);
            await _context.SaveChangesAsync();
            
            // Handle Custom Values for Create
             if (contact.CustomValues != null && contact.CustomValues.Any())
            {
                foreach (var field in contact.CustomValues)
                {
                    field.EntityId = contact.Id;
                    field.EntityType = "Contact";
                    field.UpdatedAt = DateTime.UtcNow;
                    // Ensure Definition is not treated as new entity
                    field.CustomFieldDefinition = null; 
                    _context.CustomFieldValues.Add(field);
                }
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetContact), new { id = contact.Id }, contact);
        }

        // PUT: api/contacts/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutContact(int id, Contact contact)
        {
            if (id != contact.Id)
            {
                return BadRequest();
            }

            contact.LastModifiedAt = DateTime.UtcNow;
            _context.Entry(contact).State = EntityState.Modified;
            
            // Handle Custom Values Update
            if (contact.CustomValues != null)
            {
                // Remove existing inputs for this entity to allow clean overwrite (simplest strategy for standard fields)
                // Or upsert. Upsert is better to preserve history if we added auditing later.
                // For now, simple Upsert.
                
                foreach (var val in contact.CustomValues)
                {
                    var existing = await _context.CustomFieldValues
                        .FirstOrDefaultAsync(v => v.EntityId == id && v.EntityType == "Contact" && v.CustomFieldDefinitionId == val.CustomFieldDefinitionId);
                        
                    if (existing != null)
                    {
                        existing.Value = val.Value;
                        existing.UpdatedAt = DateTime.UtcNow;
                        _context.Entry(existing).State = EntityState.Modified;
                    }
                    else
                    {
                        val.EntityId = id;
                        val.EntityType = "Contact";
                        val.UpdatedAt = DateTime.UtcNow;
                        val.CustomFieldDefinition = null!; // Prevent nav prop issues
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
                if (!ContactExists(id))
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

        // DELETE: api/contacts/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContact(int id)
        {
            var contact = await _context.Contacts.FindAsync(id);
            if (contact == null)
            {
                return NotFound();
            }

            _context.Contacts.Remove(contact);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/contacts/search
        [HttpPost("search")]
        public async Task<ActionResult<IEnumerable<Contact>>> SearchContacts(AdvancedSearchRequestDto request)
        {
            var query = _context.Contacts.AsQueryable();

            if (request.Criteria == null || !request.Criteria.Any())
            {
                return await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
            }

            // For OR logic, we need to collect results and union them
            // For AND logic, we chain the where clauses
            if (request.MatchType == "Any")
            {
                var combinedResults = new List<Contact>();
                foreach (var criteria in request.Criteria)
                {
                    var fieldQuery = _context.Contacts.AsQueryable();
                    fieldQuery = ApplyCriteria(fieldQuery, criteria);
                    combinedResults.AddRange(await fieldQuery.ToListAsync());
                }
                return combinedResults.DistinctBy(c => c.Id).OrderByDescending(c => c.CreatedAt).ToList();
            }
            else // Default to "All" (AND)
            {
                foreach (var criteria in request.Criteria)
                {
                    query = ApplyCriteria(query, criteria);
                }
                return await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
            }
        }

        private IQueryable<Contact> ApplyCriteria(IQueryable<Contact> query, SearchCriteriaDto criteria)
        {
            var field = criteria.Field.ToLower();
            var op = criteria.Operator;
            var val = criteria.Value.ToLower();

            if (string.IsNullOrEmpty(val)) return query;

            if (field == "company")
            {
                if (op == "Contains") return query.Where(c => c.Company != null && c.Company.Name.ToLower().Contains(val));
                else if (op == "Equals") return query.Where(c => c.Company != null && c.Company.Name.ToLower() == val);
            }
            else if (field == "firstname" || field == "first name" || field == "contact")
            {
                if (op == "Contains") return query.Where(c => c.FirstName.ToLower().Contains(val) || c.LastName.ToLower().Contains(val));
                else if (op == "Equals") return query.Where(c => c.FirstName.ToLower() == val || c.LastName.ToLower() == val);
                else if (op == "Starts With") return query.Where(c => c.FirstName.ToLower().StartsWith(val));
            }
            else if (field == "lastname" || field == "last name")
            {
                if (op == "Contains") return query.Where(c => c.LastName.ToLower().Contains(val));
                else if (op == "Equals") return query.Where(c => c.LastName.ToLower() == val);
            }
            else if (field == "email")
            {
                if (op == "Contains") return query.Where(c => c.Email != null && c.Email.ToLower().Contains(val));
            }
            else if (field == "jobtitle" || field == "job title")
            {
                if (op == "Contains") return query.Where(c => c.JobTitle != null && c.JobTitle.ToLower().Contains(val));
            }
            else if (field == "city")
            {
                if (op == "Contains") return query.Where(c => c.City != null && c.City.ToLower().Contains(val));
            }
            return query;
        }

        // =============================================
        // Contact Emails (Week 1)
        // =============================================

        // POST: api/contacts/5/emails
        [HttpPost("{contactId}/emails")]
        public async Task<ActionResult<ContactEmail>> PostContactEmail(int contactId, ContactEmail email)
        {
            if (contactId != email.ContactId && email.ContactId != 0)
                return BadRequest("Contact ID mismatch");
            
            email.ContactId = contactId;
            email.CreatedAt = DateTime.UtcNow;

            // Check if this is the first email, if so make it primary
            if (!await _context.ContactEmails.AnyAsync(e => e.ContactId == contactId))
            {
                email.IsPrimary = true;
            }
            
            if (email.IsPrimary)
            {
                var existing = await _context.ContactEmails.Where(e => e.ContactId == contactId).ToListAsync();
                foreach (var item in existing) item.IsPrimary = false;
            }

            _context.ContactEmails.Add(email);
            await _context.SaveChangesAsync();

            // Sync with legacy field if primary
            if (email.IsPrimary)
            {
                var contact = await _context.Contacts.FindAsync(contactId);
                if (contact != null)
                {
                    contact.Email = email.Email;
                    contact.LastModifiedAt = DateTime.UtcNow;
                    _context.Entry(contact).State = EntityState.Modified;
                    await _context.SaveChangesAsync();
                }
            }

            return CreatedAtAction(nameof(GetContact), new { id = contactId }, email);
        }

        // PUT: api/contacts/5/emails/10
        [HttpPut("{contactId}/emails/{emailId}")]
        public async Task<IActionResult> PutContactEmail(int contactId, int emailId, ContactEmail email)
        {
            if (emailId != email.Id) return BadRequest();
            if (contactId != email.ContactId) return BadRequest();

            email.UpdatedAt = DateTime.UtcNow;
            _context.Entry(email).State = EntityState.Modified;

            if (email.IsPrimary)
            {
                 var existing = await _context.ContactEmails.Where(e => e.ContactId == contactId && e.Id != emailId).ToListAsync();
                 foreach (var item in existing) item.IsPrimary = false;
            }

            try
            {
                await _context.SaveChangesAsync();
                
                 // Sync with legacy field if primary
                if (email.IsPrimary)
                {
                    var contact = await _context.Contacts.FindAsync(contactId);
                    if (contact != null)
                    {
                        contact.Email = email.Email;
                        contact.LastModifiedAt = DateTime.UtcNow;
                        _context.Entry(contact).State = EntityState.Modified;
                        await _context.SaveChangesAsync();
                    }
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.ContactEmails.Any(e => e.Id == emailId)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // DELETE: api/contacts/5/emails/10
        [HttpDelete("{contactId}/emails/{emailId}")]
        public async Task<IActionResult> DeleteContactEmail(int contactId, int emailId)
        {
            var email = await _context.ContactEmails.FindAsync(emailId);
            if (email == null) return NotFound();
            if (email.ContactId != contactId) return BadRequest();

            _context.ContactEmails.Remove(email);
            
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: api/contacts/5/emails/10/set-primary
        [HttpPost("{contactId}/emails/{emailId}/set-primary")]
        public async Task<IActionResult> SetPrimaryEmail(int contactId, int emailId)
        {
            var email = await _context.ContactEmails.FindAsync(emailId);
            if (email == null) return NotFound();
            if (email.ContactId != contactId) return BadRequest();

            var allEmails = await _context.ContactEmails.Where(e => e.ContactId == contactId).ToListAsync();
            foreach (var e in allEmails)
            {
                e.IsPrimary = (e.Id == emailId);
            }

            // Sync legacy Email field
            var contact = await _context.Contacts.FindAsync(contactId);
            if (contact != null)
            {
                contact.Email = email.Email;
                contact.LastModifiedAt = DateTime.UtcNow;
                _context.Entry(contact).State = EntityState.Modified;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // =============================================
        // Contact Addresses (Week 1)
        // =============================================
        
        // POST: api/contacts/5/addresses
        [HttpPost("{contactId}/addresses")]
        public async Task<ActionResult<ContactAddress>> PostContactAddress(int contactId, ContactAddress address)
        {
             if (contactId != address.ContactId && address.ContactId != 0)
                return BadRequest("Contact ID mismatch");
            
            address.ContactId = contactId;
            address.CreatedAt = DateTime.UtcNow;

            if (!await _context.ContactAddresses.AnyAsync(a => a.ContactId == contactId))
            {
                address.IsPrimary = true;
            }

             if (address.IsPrimary)
            {
                var existing = await _context.ContactAddresses.Where(a => a.ContactId == contactId).ToListAsync();
                foreach (var item in existing) item.IsPrimary = false;
            }

            _context.ContactAddresses.Add(address);
            await _context.SaveChangesAsync();

            // Sync legacy fields
            if (address.IsPrimary)
            {
                var contact = await _context.Contacts.FindAsync(contactId);
                if (contact != null)
                {
                    contact.Address1 = address.Address1;
                    contact.Address2 = address.Address2;
                    contact.City = address.City;
                    contact.State = address.State;
                    contact.Zip = address.PostalCode;
                    contact.Country = address.Country;
                    contact.LastModifiedAt = DateTime.UtcNow;
                    _context.Entry(contact).State = EntityState.Modified;
                    await _context.SaveChangesAsync();
                }
            }

            return CreatedAtAction(nameof(GetContact), new { id = contactId }, address);
        }

        // PUT: api/contacts/5/addresses/10
        [HttpPut("{contactId}/addresses/{addressId}")]
        public async Task<IActionResult> PutContactAddress(int contactId, int addressId, ContactAddress address)
        {
            if (addressId != address.Id) return BadRequest();
            if (contactId != address.ContactId) return BadRequest();

            address.UpdatedAt = DateTime.UtcNow;
            _context.Entry(address).State = EntityState.Modified;

            if (address.IsPrimary)
            {
                 var existing = await _context.ContactAddresses.Where(a => a.ContactId == contactId && a.Id != addressId).ToListAsync();
                 foreach (var item in existing) item.IsPrimary = false;
            }

            try
            {
                await _context.SaveChangesAsync();
                
                 // Sync legacy fields
                if (address.IsPrimary)
                {
                    var contact = await _context.Contacts.FindAsync(contactId);
                    if (contact != null)
                    {
                        contact.Address1 = address.Address1;
                        contact.Address2 = address.Address2;
                        contact.City = address.City;
                        contact.State = address.State;
                        contact.Zip = address.PostalCode;
                        contact.Country = address.Country;
                        contact.LastModifiedAt = DateTime.UtcNow;
                        _context.Entry(contact).State = EntityState.Modified;
                        await _context.SaveChangesAsync();
                    }
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                 if (!_context.ContactAddresses.Any(a => a.Id == addressId)) return NotFound();
                else throw;
            }
            return NoContent();
        }

        // DELETE: api/contacts/5/addresses/10
        [HttpDelete("{contactId}/addresses/{addressId}")]
        public async Task<IActionResult> DeleteContactAddress(int contactId, int addressId)
        {
            var address = await _context.ContactAddresses.FindAsync(addressId);
            if (address == null) return NotFound();
            if (address.ContactId != contactId) return BadRequest();

            _context.ContactAddresses.Remove(address);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: api/contacts/5/addresses/10/set-primary
        [HttpPost("{contactId}/addresses/{addressId}/set-primary")]
        public async Task<IActionResult> SetPrimaryAddress(int contactId, int addressId)
        {
            var address = await _context.ContactAddresses.FindAsync(addressId);
            if (address == null) return NotFound();
            if (address.ContactId != contactId) return BadRequest();

            var allAddresses = await _context.ContactAddresses.Where(a => a.ContactId == contactId).ToListAsync();
            foreach (var a in allAddresses)
            {
                a.IsPrimary = (a.Id == addressId);
            }

            // Update legacy address fields
            var contact = await _context.Contacts.FindAsync(contactId);
            if (contact != null)
            {
                contact.Address1 = address.Address1;
                contact.Address2 = address.Address2;
                contact.City = address.City;
                contact.State = address.State;
                contact.Zip = address.PostalCode;
                contact.Country = address.Country;
                contact.LastModifiedAt = DateTime.UtcNow;
                _context.Entry(contact).State = EntityState.Modified;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // =============================================
        // Personal Info (Week 3)
        // =============================================

        // GET: api/contacts/5/personalinfo
        [HttpGet("{contactId}/personalinfo")]
        public async Task<ActionResult<ContactPersonalInfo>> GetContactPersonalInfo(int contactId)
        {
            var info = await _context.ContactPersonalInfos.FirstOrDefaultAsync(p => p.ContactId == contactId);
            if (info == null) return NotFound();
            return info;
        }

        // PUT: api/contacts/5/personalinfo
        [HttpPut("{contactId}/personalinfo")]
        public async Task<IActionResult> PutContactPersonalInfo(int contactId, ContactPersonalInfo info)
        {
            if (contactId != info.ContactId) return BadRequest();

            var existing = await _context.ContactPersonalInfos.FirstOrDefaultAsync(p => p.ContactId == contactId);
            if (existing != null)
            {
                existing.DateOfBirth = info.DateOfBirth;
                existing.Anniversary = info.Anniversary;
                existing.Spouse = info.Spouse;
                existing.Children = info.Children;
                existing.Education = info.Education;
                existing.Hobbies = info.Hobbies;
                existing.Achievements = info.Achievements;
                existing.PersonalNotes = info.PersonalNotes;
                existing.LinkedIn = info.LinkedIn;
                existing.Twitter = info.Twitter;
                existing.UpdatedAt = DateTime.UtcNow;
                _context.Entry(existing).State = EntityState.Modified;
            }
            else
            {
                info.CreatedAt = DateTime.UtcNow;
                _context.ContactPersonalInfos.Add(info);
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (!ContactExists(contactId)) return NotFound();
                throw;
            }

            return NoContent();
        }

        // =============================================
        // Web Info (Week 3)
        // =============================================

        // GET: api/contacts/5/webinfo
        [HttpGet("{contactId}/webinfo")]
        public async Task<ActionResult<ContactWebInfo>> GetContactWebInfo(int contactId)
        {
            var info = await _context.ContactWebInfos
                .Include(w => w.CustomLinks)
                .FirstOrDefaultAsync(w => w.ContactId == contactId);
                
            if (info == null) return NotFound();
            return info;
        }

        // PUT: api/contacts/5/webinfo
        [HttpPut("{contactId}/webinfo")]
        public async Task<IActionResult> PutContactWebInfo(int contactId, ContactWebInfo info)
        {
            if (contactId != info.ContactId) return BadRequest();

            var existing = await _context.ContactWebInfos
                .Include(w => w.CustomLinks)
                .FirstOrDefaultAsync(w => w.ContactId == contactId);

            if (existing != null)
            {
                existing.Website = info.Website;
                existing.Blog = info.Blog;
                existing.Portfolio = info.Portfolio;
                existing.UpdatedAt = DateTime.UtcNow;

                // Handle CustomLinks collection update (Basic replacement strategy)
                _context.ContactWebLinks.RemoveRange(existing.CustomLinks);
                if (info.CustomLinks != null)
                {
                    foreach (var link in info.CustomLinks)
                    {
                        link.Id = 0; // Reset ID to ensure insert
                        link.ContactWebInfoId = existing.Id;
                        link.CreatedAt = DateTime.UtcNow;
                        _context.ContactWebLinks.Add(link);
                    }
                }
                
                _context.Entry(existing).State = EntityState.Modified;
            }
            else
            {
                info.CreatedAt = DateTime.UtcNow;
                if (info.CustomLinks != null)
                {
                    foreach (var link in info.CustomLinks) link.CreatedAt = DateTime.UtcNow;
                }
                _context.ContactWebInfos.Add(info);
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (!ContactExists(contactId)) return NotFound();
                throw;
            }

            return NoContent();
        }

        private bool ContactExists(int id)
        {
            return _context.Contacts.Any(e => e.Id == id);
        }
    }
}
