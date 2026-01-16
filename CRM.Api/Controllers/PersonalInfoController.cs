using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/contacts/{contactId}/personalinfo")]
    public class PersonalInfoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PersonalInfoController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/contacts/{contactId}/personalinfo
        [HttpGet]
        public async Task<ActionResult<ContactPersonalInfo>> GetPersonalInfo(int contactId)
        {
            var info = await _context.ContactPersonalInfos
                .FirstOrDefaultAsync(p => p.ContactId == contactId);

            if (info == null)
            {
                // Return empty object with correct ID if not exists, so frontend can bind to it
                return new ContactPersonalInfo { ContactId = contactId };
            }

            return info;
        }

        // PUT: api/contacts/{contactId}/personalinfo
        [HttpPut]
        public async Task<IActionResult> UpdatePersonalInfo(int contactId, ContactPersonalInfo personalInfo)
        {
            if (contactId != personalInfo.ContactId && personalInfo.ContactId != 0)
            {
                return BadRequest("Contact ID mismatch");
            }

            var existing = await _context.ContactPersonalInfos
                .FirstOrDefaultAsync(p => p.ContactId == contactId);

            if (existing == null)
            {
                // Create new
                personalInfo.ContactId = contactId;
                personalInfo.CreatedAt = DateTime.UtcNow;
                _context.ContactPersonalInfos.Add(personalInfo);
            }
            else
            {
                // Update existing fields
                existing.DateOfBirth = personalInfo.DateOfBirth;
                existing.Anniversary = personalInfo.Anniversary;
                existing.Spouse = personalInfo.Spouse;
                existing.Children = personalInfo.Children;
                existing.Education = personalInfo.Education;
                existing.Hobbies = personalInfo.Hobbies;
                existing.Achievements = personalInfo.Achievements;
                existing.PersonalNotes = personalInfo.PersonalNotes;
                existing.LinkedIn = personalInfo.LinkedIn;
                existing.Twitter = personalInfo.Twitter;
                existing.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
