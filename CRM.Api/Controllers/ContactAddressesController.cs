using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;
using CRM.Api.DTOs.Contacts;

namespace CRM.Api.Controllers
{
    /// <summary>
    /// Controller for managing contact addresses
    /// </summary>
    [ApiController]
    [Route("api/contacts/{contactId}/addresses")]
    [Authorize]
    public class ContactAddressesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ContactAddressesController> _logger;

        public ContactAddressesController(ApplicationDbContext context, ILogger<ContactAddressesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get all addresses for a contact
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ContactAddressDto>>> GetContactAddresses(int contactId)
        {
            var contact = await _context.Contacts.FindAsync(contactId);
            if (contact == null)
                return NotFound(new { message = "Contact not found" });

            var addresses = await _context.ContactAddresses
                .Where(a => a.ContactId == contactId)
                .OrderBy(a => a.SortOrder)
                .ThenByDescending(a => a.IsPrimary)
                .Select(a => new ContactAddressDto
                {
                    Id = a.Id,
                    ContactId = a.ContactId,
                    AddressType = a.AddressType,
                    Label = a.Label,
                    Address1 = a.Address1,
                    Address2 = a.Address2,
                    Address3 = a.Address3,
                    City = a.City,
                    State = a.State,
                    PostalCode = a.PostalCode,
                    Country = a.Country,
                    County = a.County,
                    IsPrimary = a.IsPrimary,
                    IsVerified = a.IsVerified,
                    Latitude = a.Latitude,
                    Longitude = a.Longitude,
                    SortOrder = a.SortOrder,
                    FormattedAddress = a.FormattedAddress,
                    SingleLineAddress = a.SingleLineAddress
                })
                .ToListAsync();

            return Ok(addresses);
        }

        /// <summary>
        /// Add a new address to a contact
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ContactAddressDto>> AddContactAddress(int contactId, [FromBody] CreateContactAddressDto dto)
        {
            var contact = await _context.Contacts.FindAsync(contactId);
            if (contact == null)
                return NotFound(new { message = "Contact not found" });

            // If this is marked as primary, unset other primary addresses
            if (dto.IsPrimary)
            {
                var existingPrimary = await _context.ContactAddresses
                    .Where(a => a.ContactId == contactId && a.IsPrimary)
                    .ToListAsync();
                
                foreach (var address in existingPrimary)
                {
                    address.IsPrimary = false;
                }
            }

            var contactAddress = new ContactAddress
            {
                ContactId = contactId,
                AddressType = dto.AddressType,
                Label = dto.Label,
                Address1 = dto.Address1,
                Address2 = dto.Address2,
                Address3 = dto.Address3,
                City = dto.City,
                State = dto.State,
                PostalCode = dto.PostalCode,
                Country = dto.Country,
                County = dto.County,
                IsPrimary = dto.IsPrimary,
                CreatedAt = DateTime.UtcNow,
                SortOrder = await _context.ContactAddresses.CountAsync(a => a.ContactId == contactId)
            };

            _context.ContactAddresses.Add(contactAddress);

            // Also update legacy address fields if this is primary
            if (dto.IsPrimary)
            {
                contact.Address1 = dto.Address1;
                contact.Address2 = dto.Address2;
                contact.City = dto.City;
                contact.State = dto.State;
                contact.Zip = dto.PostalCode;
                contact.Country = dto.Country;
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Added address to contact {ContactId}", contactId);

            return CreatedAtAction(nameof(GetContactAddresses), new { contactId }, new ContactAddressDto
            {
                Id = contactAddress.Id,
                ContactId = contactAddress.ContactId,
                AddressType = contactAddress.AddressType,
                Label = contactAddress.Label,
                Address1 = contactAddress.Address1,
                Address2 = contactAddress.Address2,
                Address3 = contactAddress.Address3,
                City = contactAddress.City,
                State = contactAddress.State,
                PostalCode = contactAddress.PostalCode,
                Country = contactAddress.Country,
                County = contactAddress.County,
                IsPrimary = contactAddress.IsPrimary,
                IsVerified = contactAddress.IsVerified,
                Latitude = contactAddress.Latitude,
                Longitude = contactAddress.Longitude,
                SortOrder = contactAddress.SortOrder,
                FormattedAddress = contactAddress.FormattedAddress,
                SingleLineAddress = contactAddress.SingleLineAddress
            });
        }

        /// <summary>
        /// Update an address
        /// </summary>
        [HttpPut("{addressId}")]
        public async Task<ActionResult<ContactAddressDto>> UpdateContactAddress(int contactId, int addressId, [FromBody] UpdateContactAddressDto dto)
        {
            var address = await _context.ContactAddresses.FirstOrDefaultAsync(a => a.Id == addressId && a.ContactId == contactId);
            if (address == null)
                return NotFound(new { message = "Address not found" });

            if (dto.AddressType != null) address.AddressType = dto.AddressType;
            if (dto.Label != null) address.Label = dto.Label;
            if (dto.Address1 != null) address.Address1 = dto.Address1;
            if (dto.Address2 != null) address.Address2 = dto.Address2;
            if (dto.Address3 != null) address.Address3 = dto.Address3;
            if (dto.City != null) address.City = dto.City;
            if (dto.State != null) address.State = dto.State;
            if (dto.PostalCode != null) address.PostalCode = dto.PostalCode;
            if (dto.Country != null) address.Country = dto.Country;
            if (dto.County != null) address.County = dto.County;

            if (dto.IsPrimary.HasValue && dto.IsPrimary.Value && !address.IsPrimary)
            {
                // Unset other primary addresses
                var existingPrimary = await _context.ContactAddresses
                    .Where(a => a.ContactId == contactId && a.IsPrimary && a.Id != addressId)
                    .ToListAsync();
                
                foreach (var a in existingPrimary)
                {
                    a.IsPrimary = false;
                }
                address.IsPrimary = true;

                // Update legacy fields
                var contact = await _context.Contacts.FindAsync(contactId);
                if (contact != null)
                {
                    contact.Address1 = address.Address1;
                    contact.Address2 = address.Address2;
                    contact.City = address.City;
                    contact.State = address.State;
                    contact.Zip = address.PostalCode;
                    contact.Country = address.Country;
                }
            }
            else if (dto.IsPrimary.HasValue)
            {
                address.IsPrimary = dto.IsPrimary.Value;
            }

            address.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new ContactAddressDto
            {
                Id = address.Id,
                ContactId = address.ContactId,
                AddressType = address.AddressType,
                Label = address.Label,
                Address1 = address.Address1,
                Address2 = address.Address2,
                Address3 = address.Address3,
                City = address.City,
                State = address.State,
                PostalCode = address.PostalCode,
                Country = address.Country,
                County = address.County,
                IsPrimary = address.IsPrimary,
                IsVerified = address.IsVerified,
                Latitude = address.Latitude,
                Longitude = address.Longitude,
                SortOrder = address.SortOrder,
                FormattedAddress = address.FormattedAddress,
                SingleLineAddress = address.SingleLineAddress
            });
        }

        /// <summary>
        /// Delete an address
        /// </summary>
        [HttpDelete("{addressId}")]
        public async Task<IActionResult> DeleteContactAddress(int contactId, int addressId)
        {
            var address = await _context.ContactAddresses.FirstOrDefaultAsync(a => a.Id == addressId && a.ContactId == contactId);
            if (address == null)
                return NotFound(new { message = "Address not found" });

            _context.ContactAddresses.Remove(address);

            // If deleting primary, set another as primary
            if (address.IsPrimary)
            {
                var nextAddress = await _context.ContactAddresses
                    .Where(a => a.ContactId == contactId && a.Id != addressId)
                    .OrderBy(a => a.SortOrder)
                    .FirstOrDefaultAsync();
                
                if (nextAddress != null)
                {
                    nextAddress.IsPrimary = true;
                    var contact = await _context.Contacts.FindAsync(contactId);
                    if (contact != null)
                    {
                        contact.Address1 = nextAddress.Address1;
                        contact.Address2 = nextAddress.Address2;
                        contact.City = nextAddress.City;
                        contact.State = nextAddress.State;
                        contact.Zip = nextAddress.PostalCode;
                        contact.Country = nextAddress.Country;
                    }
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Deleted address {AddressId} from contact {ContactId}", addressId, contactId);

            return NoContent();
        }

        /// <summary>
        /// Set an address as primary
        /// </summary>
        [HttpPost("{addressId}/set-primary")]
        public async Task<IActionResult> SetPrimaryAddress(int contactId, int addressId)
        {
            var address = await _context.ContactAddresses.FirstOrDefaultAsync(a => a.Id == addressId && a.ContactId == contactId);
            if (address == null)
                return NotFound(new { message = "Address not found" });

            // Unset other primary addresses
            var existingPrimary = await _context.ContactAddresses
                .Where(a => a.ContactId == contactId && a.IsPrimary)
                .ToListAsync();
            
            foreach (var a in existingPrimary)
            {
                a.IsPrimary = false;
            }

            address.IsPrimary = true;

            // Update legacy fields
            var contact = await _context.Contacts.FindAsync(contactId);
            if (contact != null)
            {
                contact.Address1 = address.Address1;
                contact.Address2 = address.Address2;
                contact.City = address.City;
                contact.State = address.State;
                contact.Zip = address.PostalCode;
                contact.Country = address.Country;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Primary address updated" });
        }

        /// <summary>
        /// Get available address types
        /// </summary>
        [HttpGet("/api/contact-address-types")]
        [AllowAnonymous]
        public ActionResult<List<TypeReferenceDto>> GetAddressTypes()
        {
            var types = AddressTypes.All.Select(t => new TypeReferenceDto
            {
                Value = t,
                Label = t
            }).ToList();

            return Ok(types);
        }
    }
}
