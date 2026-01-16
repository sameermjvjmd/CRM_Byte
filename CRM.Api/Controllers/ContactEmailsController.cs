using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;
using CRM.Api.DTOs.Contacts;

namespace CRM.Api.Controllers
{
    /// <summary>
    /// Controller for managing contact email addresses
    /// </summary>
    [ApiController]
    [Route("api/contacts/{contactId}/emails")]
    [Authorize]
    public class ContactEmailsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ContactEmailsController> _logger;

        public ContactEmailsController(ApplicationDbContext context, ILogger<ContactEmailsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get all email addresses for a contact
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ContactEmailDto>>> GetContactEmails(int contactId)
        {
            var contact = await _context.Contacts.FindAsync(contactId);
            if (contact == null)
                return NotFound(new { message = "Contact not found" });

            var emails = await _context.ContactEmails
                .Where(e => e.ContactId == contactId)
                .OrderBy(e => e.SortOrder)
                .ThenByDescending(e => e.IsPrimary)
                .Select(e => new ContactEmailDto
                {
                    Id = e.Id,
                    ContactId = e.ContactId,
                    Email = e.Email,
                    EmailType = e.EmailType,
                    Label = e.Label,
                    IsPrimary = e.IsPrimary,
                    AllowMarketing = e.AllowMarketing,
                    OptedOut = e.OptedOut,
                    IsVerified = e.IsVerified,
                    SortOrder = e.SortOrder
                })
                .ToListAsync();

            return Ok(emails);
        }

        /// <summary>
        /// Add a new email address to a contact
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ContactEmailDto>> AddContactEmail(int contactId, [FromBody] CreateContactEmailDto dto)
        {
            var contact = await _context.Contacts.FindAsync(contactId);
            if (contact == null)
                return NotFound(new { message = "Contact not found" });

            // Validate email format
            if (string.IsNullOrEmpty(dto.Email) || !dto.Email.Contains("@"))
                return BadRequest(new { message = "Invalid email address" });

            // If this is marked as primary, unset other primary emails
            if (dto.IsPrimary)
            {
                var existingPrimary = await _context.ContactEmails
                    .Where(e => e.ContactId == contactId && e.IsPrimary)
                    .ToListAsync();
                
                foreach (var email in existingPrimary)
                {
                    email.IsPrimary = false;
                }
            }

            var contactEmail = new ContactEmail
            {
                ContactId = contactId,
                Email = dto.Email,
                EmailType = dto.EmailType,
                Label = dto.Label,
                IsPrimary = dto.IsPrimary,
                AllowMarketing = dto.AllowMarketing,
                CreatedAt = DateTime.UtcNow,
                SortOrder = await _context.ContactEmails.CountAsync(e => e.ContactId == contactId)
            };

            _context.ContactEmails.Add(contactEmail);

            // Also update legacy email field if this is primary
            if (dto.IsPrimary)
            {
                contact.Email = dto.Email;
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Added email {Email} to contact {ContactId}", dto.Email, contactId);

            return CreatedAtAction(nameof(GetContactEmails), new { contactId }, new ContactEmailDto
            {
                Id = contactEmail.Id,
                ContactId = contactEmail.ContactId,
                Email = contactEmail.Email,
                EmailType = contactEmail.EmailType,
                Label = contactEmail.Label,
                IsPrimary = contactEmail.IsPrimary,
                AllowMarketing = contactEmail.AllowMarketing,
                OptedOut = contactEmail.OptedOut,
                IsVerified = contactEmail.IsVerified,
                SortOrder = contactEmail.SortOrder
            });
        }

        /// <summary>
        /// Update an email address
        /// </summary>
        [HttpPut("{emailId}")]
        public async Task<ActionResult<ContactEmailDto>> UpdateContactEmail(int contactId, int emailId, [FromBody] UpdateContactEmailDto dto)
        {
            var email = await _context.ContactEmails.FirstOrDefaultAsync(e => e.Id == emailId && e.ContactId == contactId);
            if (email == null)
                return NotFound(new { message = "Email not found" });

            if (dto.Email != null)
            {
                if (!dto.Email.Contains("@"))
                    return BadRequest(new { message = "Invalid email address" });
                email.Email = dto.Email;
            }

            if (dto.EmailType != null) email.EmailType = dto.EmailType;
            if (dto.Label != null) email.Label = dto.Label;
            if (dto.AllowMarketing.HasValue) email.AllowMarketing = dto.AllowMarketing.Value;
            if (dto.OptedOut.HasValue) email.OptedOut = dto.OptedOut.Value;

            if (dto.IsPrimary.HasValue && dto.IsPrimary.Value && !email.IsPrimary)
            {
                // Unset other primary emails
                var existingPrimary = await _context.ContactEmails
                    .Where(e => e.ContactId == contactId && e.IsPrimary && e.Id != emailId)
                    .ToListAsync();
                
                foreach (var e in existingPrimary)
                {
                    e.IsPrimary = false;
                }
                email.IsPrimary = true;

                // Update legacy field
                var contact = await _context.Contacts.FindAsync(contactId);
                if (contact != null)
                {
                    contact.Email = email.Email;
                }
            }
            else if (dto.IsPrimary.HasValue)
            {
                email.IsPrimary = dto.IsPrimary.Value;
            }

            email.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new ContactEmailDto
            {
                Id = email.Id,
                ContactId = email.ContactId,
                Email = email.Email,
                EmailType = email.EmailType,
                Label = email.Label,
                IsPrimary = email.IsPrimary,
                AllowMarketing = email.AllowMarketing,
                OptedOut = email.OptedOut,
                IsVerified = email.IsVerified,
                SortOrder = email.SortOrder
            });
        }

        /// <summary>
        /// Delete an email address
        /// </summary>
        [HttpDelete("{emailId}")]
        public async Task<IActionResult> DeleteContactEmail(int contactId, int emailId)
        {
            var email = await _context.ContactEmails.FirstOrDefaultAsync(e => e.Id == emailId && e.ContactId == contactId);
            if (email == null)
                return NotFound(new { message = "Email not found" });

            // Don't allow deleting the primary email if it's the only one
            var emailCount = await _context.ContactEmails.CountAsync(e => e.ContactId == contactId);
            if (email.IsPrimary && emailCount == 1)
            {
                return BadRequest(new { message = "Cannot delete the only email address. Add another email first." });
            }

            _context.ContactEmails.Remove(email);

            // If deleting primary, set another as primary
            if (email.IsPrimary)
            {
                var nextEmail = await _context.ContactEmails
                    .Where(e => e.ContactId == contactId && e.Id != emailId)
                    .OrderBy(e => e.SortOrder)
                    .FirstOrDefaultAsync();
                
                if (nextEmail != null)
                {
                    nextEmail.IsPrimary = true;
                    var contact = await _context.Contacts.FindAsync(contactId);
                    if (contact != null)
                    {
                        contact.Email = nextEmail.Email;
                    }
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Deleted email {EmailId} from contact {ContactId}", emailId, contactId);

            return NoContent();
        }

        /// <summary>
        /// Set an email as primary
        /// </summary>
        [HttpPost("{emailId}/set-primary")]
        public async Task<IActionResult> SetPrimaryEmail(int contactId, int emailId)
        {
            var email = await _context.ContactEmails.FirstOrDefaultAsync(e => e.Id == emailId && e.ContactId == contactId);
            if (email == null)
                return NotFound(new { message = "Email not found" });

            // Unset other primary emails
            var existingPrimary = await _context.ContactEmails
                .Where(e => e.ContactId == contactId && e.IsPrimary)
                .ToListAsync();
            
            foreach (var e in existingPrimary)
            {
                e.IsPrimary = false;
            }

            email.IsPrimary = true;

            // Update legacy field
            var contact = await _context.Contacts.FindAsync(contactId);
            if (contact != null)
            {
                contact.Email = email.Email;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Primary email updated" });
        }

        /// <summary>
        /// Get available email types
        /// </summary>
        [HttpGet("/api/contact-email-types")]
        [AllowAnonymous]
        public ActionResult<List<TypeReferenceDto>> GetEmailTypes()
        {
            var types = EmailTypes.All.Select(t => new TypeReferenceDto
            {
                Value = t,
                Label = t
            }).ToList();

            return Ok(types);
        }
    }
}
