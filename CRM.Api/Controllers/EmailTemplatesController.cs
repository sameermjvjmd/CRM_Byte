using CRM.Api.Data;
using CRM.Api.DTOs.Email;
using CRM.Api.Models.Email;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CRM.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class EmailTemplatesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EmailTemplatesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmailTemplateDto>>> GetTemplates()
        {
            var templates = await _context.EmailTemplates
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new EmailTemplateDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    Subject = t.Subject,
                    Body = t.Body,
                    Category = t.Category,
                    DesignJson = t.DesignJson,
                    IsActive = t.IsActive,
                    CreatedBy = t.CreatedBy,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt
                })
                .ToListAsync();

            return Ok(templates);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EmailTemplateDto>> GetTemplate(int id)
        {
            var template = await _context.EmailTemplates.FindAsync(id);

            if (template == null)
            {
                return NotFound();
            }

            return new EmailTemplateDto
            {
                Id = template.Id,
                Name = template.Name,
                Subject = template.Subject,
                Body = template.Body,
                Category = template.Category,
                DesignJson = template.DesignJson,
                IsActive = template.IsActive,
                CreatedBy = template.CreatedBy,
                CreatedAt = template.CreatedAt,
                UpdatedAt = template.UpdatedAt
            };
        }

        [HttpPost]
        public async Task<ActionResult<EmailTemplateDto>> CreateTemplate(CreateEmailTemplateDto createDto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            var template = new EmailTemplate
            {
                Name = createDto.Name,
                Subject = createDto.Subject,
                Body = createDto.Body,
                Category = createDto.Category,
                DesignJson = createDto.DesignJson,
                IsActive = true,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.EmailTemplates.Add(template);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTemplate), new { id = template.Id }, new EmailTemplateDto
            {
                Id = template.Id,
                Name = template.Name,
                Subject = template.Subject,
                Body = template.Body,
                Category = template.Category,
                DesignJson = template.DesignJson,
                IsActive = template.IsActive,
                CreatedBy = template.CreatedBy,
                CreatedAt = template.CreatedAt
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTemplate(int id, UpdateEmailTemplateDto updateDto)
        {
            var template = await _context.EmailTemplates.FindAsync(id);
            if (template == null)
            {
                return NotFound();
            }

            template.Name = updateDto.Name;
            template.Subject = updateDto.Subject;
            template.Body = updateDto.Body;
            template.Category = updateDto.Category;
            template.DesignJson = updateDto.DesignJson;
            template.IsActive = updateDto.IsActive;
            template.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTemplate(int id)
        {
            var template = await _context.EmailTemplates.FindAsync(id);
            if (template == null)
            {
                return NotFound();
            }

            _context.EmailTemplates.Remove(template);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
