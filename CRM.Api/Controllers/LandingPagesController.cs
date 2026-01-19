using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models.Marketing;
using CRM.Api.Models;
using CRM.Api.DTOs.Marketing;
using System.Security.Claims;
using System.Text.Json;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LandingPagesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<LandingPagesController> _logger;
        private readonly CRM.Api.Services.Marketing.ILeadScoringService _leadScoringService;

        public LandingPagesController(
            ApplicationDbContext context, 
            ILogger<LandingPagesController> logger,
            CRM.Api.Services.Marketing.ILeadScoringService leadScoringService)
        {
            _context = context;
            _logger = logger;
            _leadScoringService = leadScoringService;
        }

        private int GetUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdStr, out int uid) ? uid : 0;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LandingPageDto>>> GetPages()
        {
            var pages = await _context.LandingPages
                .Include(p => p.WebForm)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(pages.Select(MapToDto));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LandingPageDto>> GetPage(int id)
        {
            var page = await _context.LandingPages
                .Include(p => p.WebForm)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (page == null) return NotFound();

            return Ok(MapToDto(page));
        }

        [HttpPost]
        public async Task<ActionResult<LandingPageDto>> CreatePage(CreateLandingPageDto dto)
        {
            // Auto-generate slug if not provided
            var slug = !string.IsNullOrWhiteSpace(dto.Slug) 
                ? dto.Slug.ToLower().Trim().Replace(" ", "-") 
                : dto.Name.ToLower().Trim().Replace(" ", "-") + "-" + Guid.NewGuid().ToString().Substring(0, 4);

            var page = new LandingPage
            {
                Name = dto.Name,
                Description = dto.Description,
                Slug = slug,
                CreatedByUserId = GetUserId(),
                CreatedAt = DateTime.UtcNow,
                JsonContent = "[]", // Start with empty builder
                Status = "Draft"
            };

            _context.LandingPages.Add(page);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPage), new { id = page.Id }, MapToDto(page));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePage(int id, UpdateLandingPageDto dto)
        {
            var page = await _context.LandingPages
                .Include(p => p.WebForm)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (page == null) return NotFound();

            page.Name = dto.Name;
            page.Slug = dto.Slug;
            page.Description = dto.Description;
            page.Status = dto.Status;
            page.HtmlContent = dto.HtmlContent;
            page.JsonContent = dto.JsonContent;
            page.Theme = dto.Theme;
            
            if (dto.Status == "Published" && page.PublishedAt == null)
            {
                page.PublishedAt = DateTime.UtcNow;
            }

            // Update or Create WebForm
            if (dto.WebForm != null)
            {
                if (page.WebForm == null)
                {
                    page.WebForm = new WebForm();
                }

                page.WebForm.Name = dto.WebForm.Name;
                page.WebForm.FormFieldsJson = dto.WebForm.FormFieldsJson;
                page.WebForm.SubmitButtonText = dto.WebForm.SubmitButtonText;
                page.WebForm.SuccessMessage = dto.WebForm.SuccessMessage;
                page.WebForm.RedirectUrl = dto.WebForm.RedirectUrl;
                page.WebForm.MarketingListId = dto.WebForm.MarketingListId;
                page.WebForm.CreateContact = dto.WebForm.CreateContact;
                page.WebForm.AssignToUserId = dto.WebForm.AssignToUserId;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePage(int id)
        {
            var page = await _context.LandingPages.FindAsync(id);
            if (page == null) return NotFound();

            _context.LandingPages.Remove(page);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ==========================================
        // PUBLIC ACCESS
        // ==========================================

        [AllowAnonymous]
        [HttpGet("public/{slug}")]
        public async Task<ActionResult<LandingPageDto>> GetPublicPage(string slug)
        {
            var page = await _context.LandingPages
                .Include(p => p.WebForm)
                .FirstOrDefaultAsync(p => p.Slug == slug && p.Status == "Published");

            if (page == null) return NotFound();

            // Increment view count (simple implementation)
            page.VisitCount++;
            await _context.SaveChangesAsync();

            return Ok(MapToDto(page));
        }

        [AllowAnonymous]
        [HttpPost("public/{id}/submit")]
        public async Task<IActionResult> SubmitForm(int id, [FromBody] PageSubmissionDto submission)
        {
            try
            {
                var page = await _context.LandingPages
                    .Include(p => p.WebForm)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (page == null || page.WebForm == null) return NotFound();

                string email = string.Empty;
                string firstName = string.Empty;
                string lastName = string.Empty;

                // Extract core fields case-insensitively
                foreach(var kvp in submission.Data)
                {
                    if (kvp.Key.Equals("email", StringComparison.OrdinalIgnoreCase)) email = kvp.Value;
                    if (kvp.Key.Equals("firstName", StringComparison.OrdinalIgnoreCase)) firstName = kvp.Value;
                    if (kvp.Key.Equals("name", StringComparison.OrdinalIgnoreCase)) firstName = kvp.Value;
                    if (kvp.Key.Equals("lastName", StringComparison.OrdinalIgnoreCase)) lastName = kvp.Value;
                }

                Contact? matchedContact = null;

                // Handle Contact Creation/Linking
                if (!string.IsNullOrWhiteSpace(email))
                {
                    matchedContact = await _context.Contacts.FirstOrDefaultAsync(c => c.Email == email);

                    if (page.WebForm.CreateContact && matchedContact == null)
                    {
                        matchedContact = new Contact
                        {
                            FirstName = !string.IsNullOrWhiteSpace(firstName) ? firstName : "Web",
                            LastName = !string.IsNullOrWhiteSpace(lastName) ? lastName : "Lead",
                            Email = email,
                            Status = "Lead",
                            LeadSource = "Waiting List",
                            CreatedAt = DateTime.UtcNow,
                            OwnerId = page.WebForm.AssignToUserId
                        };
                        _context.Contacts.Add(matchedContact);
                        await _context.SaveChangesAsync(); // Force ID generation
                    }
                }

                // Handle Marketing List
                if (page.WebForm.MarketingListId.HasValue && !string.IsNullOrWhiteSpace(email))
                {
                    var listMember = await _context.MarketingListMembers
                        .FirstOrDefaultAsync(m => m.MarketingListId == page.WebForm.MarketingListId && m.Email == email);

                    if (listMember == null)
                    {
                        _context.MarketingListMembers.Add(new MarketingListMember
                        {
                            MarketingListId = page.WebForm.MarketingListId.Value,
                            Email = email,
                            FirstName = firstName,
                            LastName = lastName,
                            Status = "Subscribed",
                            IsConfirmed = true,
                            Source = "Landing Page",
                            SubscribedAt = DateTime.UtcNow,
                            ContactId = matchedContact?.Id
                        });
                    }
                }

                // Record Submission
                var subRecord = new LandingPageSubmission
                {
                    LandingPageId = id,
                    ContactId = matchedContact?.Id, // Safe now
                    SubmittedDataJson = JsonSerializer.Serialize(submission.Data),
                    IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                    SubmittedAt = DateTime.UtcNow
                };
                
                _context.LandingPageSubmissions.Add(subRecord);
                page.SubmissionCount++;

                await _context.SaveChangesAsync();

                // Trigger Lead Scoring
                if (subRecord.ContactId.HasValue)
                {
                    await _leadScoringService.EvaluateRulesAsync("FormSubmit", subRecord.ContactId.Value, submission);
                }

                return Ok(new { message = page.WebForm.SuccessMessage, redirectUrl = page.WebForm.RedirectUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, stack = ex.StackTrace, inner = ex.InnerException?.Message });
            }
        }


        private static LandingPageDto MapToDto(LandingPage p)
        {
            return new LandingPageDto
            {
                Id = p.Id,
                Name = p.Name,
                Slug = p.Slug,
                Description = p.Description,
                Status = p.Status,
                HtmlContent = p.HtmlContent,
                JsonContent = p.JsonContent,
                Theme = p.Theme,
                VisitCount = p.VisitCount,
                SubmissionCount = p.SubmissionCount,
                CreatedAt = p.CreatedAt,
                PublishedAt = p.PublishedAt,
                WebForm = p.WebForm != null ? new WebFormDto
                {
                    Id = p.WebForm.Id,
                    Name = p.WebForm.Name,
                    FormFieldsJson = p.WebForm.FormFieldsJson,
                    SubmitButtonText = p.WebForm.SubmitButtonText,
                    SuccessMessage = p.WebForm.SuccessMessage,
                    RedirectUrl = p.WebForm.RedirectUrl,
                    MarketingListId = p.WebForm.MarketingListId,
                    CreateContact = p.WebForm.CreateContact,
                    AssignToUserId = p.WebForm.AssignToUserId
                } : null
            };
        }
    }
}
