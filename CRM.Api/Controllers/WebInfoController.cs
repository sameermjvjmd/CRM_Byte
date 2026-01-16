using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/contacts/{contactId}/webinfo")]
    public class WebInfoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public WebInfoController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/contacts/{contactId}/webinfo
        [HttpGet]
        public async Task<ActionResult<ContactWebInfo>> GetWebInfo(int contactId)
        {
            var info = await _context.ContactWebInfos
                .Include(w => w.CustomLinks)
                .FirstOrDefaultAsync(w => w.ContactId == contactId);

            if (info == null)
            {
                return new ContactWebInfo 
                { 
                    ContactId = contactId,
                    CustomLinks = new List<ContactWebLink>()
                };
            }

            return info;
        }

        // PUT: api/contacts/{contactId}/webinfo
        [HttpPut]
        public async Task<IActionResult> UpdateWebInfo(int contactId, ContactWebInfo webInfo)
        {
            var existing = await _context.ContactWebInfos
                .Include(w => w.CustomLinks)
                .FirstOrDefaultAsync(w => w.ContactId == contactId);

            if (existing == null)
            {
                webInfo.ContactId = contactId;
                webInfo.CreatedAt = DateTime.UtcNow;
                // Custom links will be added automatically via cascade if present
                _context.ContactWebInfos.Add(webInfo);
            }
            else
            {
                existing.Website = webInfo.Website;
                existing.Blog = webInfo.Blog;
                existing.Portfolio = webInfo.Portfolio;
                existing.UpdatedAt = DateTime.UtcNow;

                // Handle Custom Links
                // 1. Remove links that are not in the new list
                var newLinkIds = webInfo.CustomLinks.Where(l => l.Id != 0).Select(l => l.Id).ToList();
                var linksToRemove = existing.CustomLinks.Where(l => !newLinkIds.Contains(l.Id)).ToList();
                
                foreach (var link in linksToRemove)
                {
                    _context.ContactWebLinks.Remove(link);
                }

                // 2. Add or Update links
                foreach (var link in webInfo.CustomLinks)
                {
                    if (link.Id == 0)
                    {
                        // New link
                        link.ContactWebInfoId = existing.Id;
                        link.CreatedAt = DateTime.UtcNow;
                        existing.CustomLinks.Add(link);
                    }
                    else
                    {
                        // Update existing link
                        var existingLink = existing.CustomLinks.FirstOrDefault(l => l.Id == link.Id);
                        if (existingLink != null)
                        {
                            existingLink.Label = link.Label;
                            existingLink.Url = link.Url;
                            existingLink.Type = link.Type;
                        }
                    }
                }
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
