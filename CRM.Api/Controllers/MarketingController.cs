using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models.Marketing;
using CRM.Api.DTOs.Marketing;
using System.Security.Claims;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MarketingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<MarketingController> _logger;

        public MarketingController(ApplicationDbContext context, ILogger<MarketingController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private int GetUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdStr, out int uid) ? uid : 0;
        }

        // =============================================
        // CAMPAIGNS
        // =============================================

        [HttpGet("campaigns")]
        public async Task<ActionResult<IEnumerable<CampaignDto>>> GetCampaigns(
            [FromQuery] string? status,
            [FromQuery] string? type)
        {
            var query = _context.MarketingCampaigns
                .Include(c => c.MarketingList)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(c => c.Status == status);

            if (!string.IsNullOrWhiteSpace(type))
                query = query.Where(c => c.Type == type);

            var campaigns = await query
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => MapToDto(c))
                .ToListAsync();

            return Ok(campaigns);
        }

        [HttpGet("campaigns/{id}")]
        public async Task<ActionResult<CampaignDto>> GetCampaign(int id)
        {
            var campaign = await _context.MarketingCampaigns
                .Include(c => c.MarketingList)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (campaign == null) return NotFound();

            return Ok(MapToDto(campaign));
        }

        [HttpPost("campaigns")]
        public async Task<ActionResult<CampaignDto>> CreateCampaign(CreateCampaignDto dto)
        {
            var campaign = new MarketingCampaign
            {
                Name = dto.Name,
                Description = dto.Description,
                Type = dto.Type,
                Subject = dto.Subject,
                HtmlContent = dto.HtmlContent,
                PlainTextContent = dto.PlainTextContent,
                TemplateId = dto.TemplateId,
                MarketingListId = dto.MarketingListId,
                ScheduledFor = dto.ScheduledFor,
                Timezone = dto.Timezone,
                IsABTest = dto.IsABTest,
                VariantASubject = dto.VariantASubject,
                VariantAContent = dto.VariantAContent,
                VariantBSubject = dto.VariantBSubject,
                VariantBContent = dto.VariantBContent,
                ABTestSamplePercentage = dto.ABTestSamplePercentage,
                Budget = dto.Budget,
                Status = "Draft",
                CreatedByUserId = GetUserId(),
                CreatedAt = DateTime.UtcNow
            };

            _context.MarketingCampaigns.Add(campaign);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCampaign), new { id = campaign.Id }, MapToDto(campaign));
        }

        [HttpPut("campaigns/{id}")]
        public async Task<IActionResult> UpdateCampaign(int id, UpdateCampaignDto dto)
        {
            var campaign = await _context.MarketingCampaigns.FindAsync(id);
            if (campaign == null) return NotFound();

            campaign.Name = dto.Name;
            campaign.Description = dto.Description;
            campaign.Type = dto.Type;
            campaign.Subject = dto.Subject;
            campaign.HtmlContent = dto.HtmlContent;
            campaign.PlainTextContent = dto.PlainTextContent;
            campaign.TemplateId = dto.TemplateId;
            campaign.MarketingListId = dto.MarketingListId;
            campaign.ScheduledFor = dto.ScheduledFor;
            campaign.Timezone = dto.Timezone;
            campaign.Status = dto.Status;
            campaign.IsABTest = dto.IsABTest;
            campaign.VariantASubject = dto.VariantASubject;
            campaign.VariantAContent = dto.VariantAContent;
            campaign.VariantBSubject = dto.VariantBSubject;
            campaign.VariantBContent = dto.VariantBContent;
            campaign.Budget = dto.Budget;
            campaign.Revenue = dto.Revenue;
            campaign.ConversionCount = dto.ConversionCount;
            campaign.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("campaigns/{id}/schedule")]
        public async Task<IActionResult> ScheduleCampaign(int id, [FromBody] ScheduleDto dto)
        {
            var campaign = await _context.MarketingCampaigns.FindAsync(id);
            if (campaign == null) return NotFound();

            campaign.ScheduledFor = dto.ScheduledFor;
            campaign.Timezone = dto.Timezone;
            campaign.Status = "Scheduled";
            campaign.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Campaign scheduled successfully" });
        }

        [HttpPost("campaigns/{id}/send")]
        public async Task<IActionResult> SendCampaign(int id)
        {
            var campaign = await _context.MarketingCampaigns
                .Include(c => c.MarketingList)
                    .ThenInclude(l => l!.Members.Where(m => m.Status == "Subscribed"))
                .FirstOrDefaultAsync(c => c.Id == id);

            if (campaign == null) return NotFound();

            if (campaign.MarketingList == null)
                return BadRequest("No marketing list assigned to this campaign");

            var recipients = campaign.MarketingList.Members?
                .Where(m => m.Status == "Subscribed" && m.IsConfirmed)
                .ToList() ?? new List<MarketingListMember>();

            if (!recipients.Any())
                return BadRequest("No eligible recipients in the marketing list");

            // Check suppression list
            var suppressedEmails = await _context.SuppressionEntries
                .Select(s => s.Email.ToLower())
                .ToListAsync();

            recipients = recipients
                .Where(r => !suppressedEmails.Contains(r.Email.ToLower()))
                .ToList();

            // Create campaign recipients
            foreach (var member in recipients)
            {
                var recipient = new CampaignRecipient
                {
                    CampaignId = id,
                    Email = member.Email,
                    ContactId = member.ContactId,
                    MarketingListMemberId = member.Id,
                    Status = "Pending"
                };
                _context.CampaignRecipients.Add(recipient);
            }

            campaign.RecipientCount = recipients.Count;
            campaign.Status = "Active";
            campaign.StartedAt = DateTime.UtcNow;
            campaign.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // In a real implementation, this would trigger a background job to send emails
            _logger.LogInformation("Campaign {Id} started with {Count} recipients", id, recipients.Count);

            return Ok(new { 
                message = "Campaign sending started", 
                recipientCount = recipients.Count 
            });
        }

        [HttpPost("campaigns/{id}/pause")]
        public async Task<IActionResult> PauseCampaign(int id)
        {
            var campaign = await _context.MarketingCampaigns.FindAsync(id);
            if (campaign == null) return NotFound();

            campaign.Status = "Paused";
            campaign.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Campaign paused" });
        }

        [HttpDelete("campaigns/{id}")]
        public async Task<IActionResult> DeleteCampaign(int id)
        {
            var campaign = await _context.MarketingCampaigns.FindAsync(id);
            if (campaign == null) return NotFound();

            _context.MarketingCampaigns.Remove(campaign);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("campaigns/{id}/analytics")]
        public async Task<ActionResult<CampaignAnalyticsDto>> GetCampaignAnalytics(int id)
        {
            var campaign = await _context.MarketingCampaigns.FindAsync(id);
            if (campaign == null) return NotFound();

            var recipients = await _context.CampaignRecipients
                .Where(r => r.CampaignId == id)
                .ToListAsync();

            var analytics = new CampaignAnalyticsDto
            {
                CampaignId = id,
                CampaignName = campaign.Name,
                TotalRecipients = campaign.RecipientCount,
                Sent = recipients.Count(r => r.SentAt.HasValue),
                Delivered = recipients.Count(r => r.DeliveredAt.HasValue),
                Opened = recipients.Count(r => r.OpenCount > 0),
                Clicked = recipients.Count(r => r.ClickCount > 0),
                Bounced = recipients.Count(r => r.Status == "Bounced"),
                Unsubscribed = recipients.Count(r => r.Status == "Unsubscribed"),
                DeliveryRate = campaign.SentCount > 0 ? (double)campaign.DeliveredCount / campaign.SentCount * 100 : 0,
                OpenRate = campaign.SentCount > 0 ? (double)campaign.UniqueOpenCount / campaign.SentCount * 100 : 0,
                ClickRate = campaign.SentCount > 0 ? (double)campaign.UniqueClickCount / campaign.SentCount * 100 : 0,
                ClickToOpenRate = campaign.UniqueOpenCount > 0 ? (double)campaign.UniqueClickCount / campaign.UniqueOpenCount * 100 : 0,
                BounceRate = campaign.SentCount > 0 ? (double)campaign.BounceCount / campaign.SentCount * 100 : 0,
                UnsubscribeRate = campaign.SentCount > 0 ? (double)campaign.UnsubscribeCount / campaign.SentCount * 100 : 0
            };

            return Ok(analytics);
        }

        // =============================================
        // MARKETING LISTS
        // =============================================

        [HttpGet("lists")]
        public async Task<ActionResult<IEnumerable<MarketingListDto>>> GetLists()
        {
            var lists = await _context.MarketingLists
                .Include(l => l.Members)
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new MarketingListDto
                {
                    Id = l.Id,
                    Name = l.Name,
                    Description = l.Description,
                    Type = l.Type,
                    Status = l.Status,
                    MemberCount = l.Members != null ? l.Members.Count : 0,
                    SubscribedCount = l.Members != null ? l.Members.Count(m => m.Status == "Subscribed") : 0,
                    UnsubscribedCount = l.Members != null ? l.Members.Count(m => m.Status == "Unsubscribed") : 0,
                    BouncedCount = l.Members != null ? l.Members.Count(m => m.Status == "Bounced") : 0,
                    RequireDoubleOptIn = l.RequireDoubleOptIn,
                    CreatedAt = l.CreatedAt,
                    LastSyncedAt = l.LastSyncedAt
                })
                .ToListAsync();

            return Ok(lists);
        }

        [HttpGet("lists/{id}")]
        public async Task<ActionResult<MarketingListDto>> GetList(int id)
        {
            var list = await _context.MarketingLists
                .Include(l => l.Members)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (list == null) return NotFound();

            return Ok(new MarketingListDto
            {
                Id = list.Id,
                Name = list.Name,
                Description = list.Description,
                Type = list.Type,
                Status = list.Status,
                MemberCount = list.Members?.Count ?? 0,
                SubscribedCount = list.Members?.Count(m => m.Status == "Subscribed") ?? 0,
                RequireDoubleOptIn = list.RequireDoubleOptIn,
                CreatedAt = list.CreatedAt
            });
        }

        [HttpPost("lists")]
        public async Task<ActionResult<MarketingListDto>> CreateList(CreateMarketingListDto dto)
        {
            var list = new MarketingList
            {
                Name = dto.Name,
                Description = dto.Description,
                Type = dto.Type,
                DynamicCriteria = dto.DynamicCriteria,
                RequireDoubleOptIn = dto.RequireDoubleOptIn,
                UnsubscribeUrl = dto.UnsubscribeUrl,
                CreatedByUserId = GetUserId(),
                CreatedAt = DateTime.UtcNow
            };

            _context.MarketingLists.Add(list);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetList), new { id = list.Id }, new MarketingListDto
            {
                Id = list.Id,
                Name = list.Name,
                Description = list.Description,
                Type = list.Type,
                CreatedAt = list.CreatedAt
            });
        }

        [HttpDelete("lists/{id}")]
        public async Task<IActionResult> DeleteList(int id)
        {
            var list = await _context.MarketingLists.FindAsync(id);
            if (list == null) return NotFound();

            _context.MarketingLists.Remove(list);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // =============================================
        // LIST MEMBERS
        // =============================================

        [HttpGet("lists/{listId}/members")]
        public async Task<ActionResult<IEnumerable<ListMemberDto>>> GetListMembers(
            int listId,
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var query = _context.MarketingListMembers
                .Where(m => m.MarketingListId == listId);

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(m => m.Status == status);

            var members = await query
                .OrderByDescending(m => m.SubscribedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(m => new ListMemberDto
                {
                    Id = m.Id,
                    MarketingListId = m.MarketingListId,
                    ContactId = m.ContactId,
                    Email = m.Email,
                    FirstName = m.FirstName,
                    LastName = m.LastName,
                    Status = m.Status,
                    SubscribedAt = m.SubscribedAt,
                    UnsubscribedAt = m.UnsubscribedAt,
                    IsConfirmed = m.IsConfirmed,
                    LeadScore = m.LeadScore,
                    Source = m.Source
                })
                .ToListAsync();

            return Ok(members);
        }

        [HttpPost("lists/{listId}/members")]
        public async Task<ActionResult<ListMemberDto>> AddMember(int listId, AddListMemberDto dto)
        {
            var list = await _context.MarketingLists.FindAsync(listId);
            if (list == null) return NotFound("List not found");

            // Check if already exists
            var existing = await _context.MarketingListMembers
                .FirstOrDefaultAsync(m => m.MarketingListId == listId && m.Email.ToLower() == dto.Email.ToLower());

            if (existing != null)
                return Conflict("Email already exists in this list");

            // Check suppression list
            var suppressed = await _context.SuppressionEntries
                .AnyAsync(s => s.Email.ToLower() == dto.Email.ToLower());

            if (suppressed)
                return BadRequest("This email is on the suppression list");

            var member = new MarketingListMember
            {
                MarketingListId = listId,
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                ContactId = dto.ContactId,
                Source = dto.Source ?? "Manual",
                CustomFields = dto.CustomFields,
                Status = list.RequireDoubleOptIn ? "Pending" : "Subscribed",
                IsConfirmed = !list.RequireDoubleOptIn,
                SubscribedAt = DateTime.UtcNow,
                ConfirmationToken = list.RequireDoubleOptIn ? Guid.NewGuid().ToString() : null
            };

            _context.MarketingListMembers.Add(member);
            list.MemberCount++;
            await _context.SaveChangesAsync();

            return Ok(new ListMemberDto
            {
                Id = member.Id,
                Email = member.Email,
                Status = member.Status,
                SubscribedAt = member.SubscribedAt
            });
        }

        [HttpPost("lists/{listId}/members/bulk")]
        public async Task<ActionResult<object>> BulkAddMembers(int listId, BulkAddMembersDto dto)
        {
            var list = await _context.MarketingLists.FindAsync(listId);
            if (list == null) return NotFound("List not found");

            var existingEmails = await _context.MarketingListMembers
                .Where(m => m.MarketingListId == listId)
                .Select(m => m.Email.ToLower())
                .ToListAsync();

            var suppressedEmails = await _context.SuppressionEntries
                .Select(s => s.Email.ToLower())
                .ToListAsync();

            int added = 0, skipped = 0;

            foreach (var memberDto in dto.Members)
            {
                var emailLower = memberDto.Email.ToLower();

                if (dto.SkipDuplicates && existingEmails.Contains(emailLower))
                {
                    skipped++;
                    continue;
                }

                if (suppressedEmails.Contains(emailLower))
                {
                    skipped++;
                    continue;
                }

                var member = new MarketingListMember
                {
                    MarketingListId = listId,
                    Email = memberDto.Email,
                    FirstName = memberDto.FirstName,
                    LastName = memberDto.LastName,
                    ContactId = memberDto.ContactId,
                    Source = memberDto.Source ?? "Import",
                    Status = list.RequireDoubleOptIn ? "Pending" : "Subscribed",
                    IsConfirmed = !list.RequireDoubleOptIn,
                    SubscribedAt = DateTime.UtcNow
                };

                _context.MarketingListMembers.Add(member);
                existingEmails.Add(emailLower);
                added++;
            }

            list.MemberCount += added;
            await _context.SaveChangesAsync();

            return Ok(new { added, skipped, total = dto.Members.Count });
        }

        [HttpDelete("lists/{listId}/members/{memberId}")]
        public async Task<IActionResult> RemoveMember(int listId, int memberId)
        {
            var member = await _context.MarketingListMembers
                .FirstOrDefaultAsync(m => m.Id == memberId && m.MarketingListId == listId);

            if (member == null) return NotFound();

            var list = await _context.MarketingLists.FindAsync(listId);
            if (list != null) list.MemberCount--;

            _context.MarketingListMembers.Remove(member);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // =============================================
        // UNSUBSCRIBE & SUPPRESSION
        // =============================================

        [AllowAnonymous]
        [HttpPost("unsubscribe")]
        public async Task<IActionResult> Unsubscribe([FromBody] UnsubscribeDto dto)
        {
            // Add to suppression list
            var suppressionEntry = new SuppressionEntry
            {
                Email = dto.Email,
                Type = "Unsubscribe",
                Reason = dto.Reason,
                CampaignId = dto.CampaignId,
                CreatedAt = DateTime.UtcNow
            };
            _context.SuppressionEntries.Add(suppressionEntry);

            // Update all list memberships
            var memberships = await _context.MarketingListMembers
                .Where(m => m.Email.ToLower() == dto.Email.ToLower())
                .ToListAsync();

            foreach (var membership in memberships)
            {
                membership.Status = "Unsubscribed";
                membership.UnsubscribedAt = DateTime.UtcNow;
                membership.UnsubscribeReason = dto.Reason;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Successfully unsubscribed" });
        }

        [HttpGet("suppression")]
        public async Task<ActionResult<IEnumerable<object>>> GetSuppressionList()
        {
            var entries = await _context.SuppressionEntries
                .OrderByDescending(s => s.CreatedAt)
                .Take(1000)
                .Select(s => new
                {
                    s.Id,
                    s.Email,
                    s.Type,
                    s.Reason,
                    s.CreatedAt
                })
                .ToListAsync();

            return Ok(entries);
        }

        [HttpPost("suppression")]
        public async Task<IActionResult> AddToSuppression([FromBody] AddSuppressionDto dto)
        {
            var entry = new SuppressionEntry
            {
                Email = dto.Email,
                Type = dto.Type ?? "Manual",
                Reason = dto.Reason,
                CreatedAt = DateTime.UtcNow
            };

            _context.SuppressionEntries.Add(entry);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Added to suppression list" });
        }

        // =============================================
        // LEAD SCORING
        // =============================================

        [HttpGet("scoring/rules")]
        public async Task<ActionResult<IEnumerable<LeadScoringRuleDto>>> GetScoringRules()
        {
            var rules = await _context.LeadScoringRules
                .OrderBy(r => r.Category)
                .ThenBy(r => r.Name)
                .Select(r => new LeadScoringRuleDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    Category = r.Category,
                    TriggerType = r.TriggerType,
                    PointsValue = r.PointsValue,
                    IsActive = r.IsActive,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(rules);
        }

        [HttpPost("scoring/rules")]
        public async Task<ActionResult<LeadScoringRuleDto>> CreateScoringRule(CreateLeadScoringRuleDto dto)
        {
            var rule = new LeadScoringRule
            {
                Name = dto.Name,
                Description = dto.Description,
                Category = dto.Category,
                TriggerType = dto.TriggerType,
                PointsValue = dto.PointsValue,
                Conditions = dto.Conditions,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.LeadScoringRules.Add(rule);
            await _context.SaveChangesAsync();

            return Ok(new LeadScoringRuleDto
            {
                Id = rule.Id,
                Name = rule.Name,
                PointsValue = rule.PointsValue,
                IsActive = rule.IsActive
            });
        }

        // =============================================
        // DASHBOARD
        // =============================================

        [HttpGet("dashboard")]
        public async Task<ActionResult<MarketingDashboardDto>> GetDashboard()
        {
            var campaigns = await _context.MarketingCampaigns.ToListAsync();
            var lists = await _context.MarketingLists.Include(l => l.Members).ToListAsync();
            var thisMonth = DateTime.UtcNow.AddDays(-30);

            var dashboard = new MarketingDashboardDto
            {
                TotalCampaigns = campaigns.Count,
                ActiveCampaigns = campaigns.Count(c => c.Status == "Active"),
                ScheduledCampaigns = campaigns.Count(c => c.Status == "Scheduled"),
                TotalSubscribers = lists.Sum(l => l.Members?.Count(m => m.Status == "Subscribed") ?? 0),
                NewSubscribersThisMonth = lists.Sum(l => l.Members?.Count(m => m.SubscribedAt >= thisMonth) ?? 0),
                TotalEmailsSent = campaigns.Sum(c => c.SentCount),
                AvgOpenRate = campaigns.Any(c => c.SentCount > 0) 
                    ? campaigns.Where(c => c.SentCount > 0).Average(c => (double)c.UniqueOpenCount / c.SentCount * 100) 
                    : 0,
                AvgClickRate = campaigns.Any(c => c.SentCount > 0)
                    ? campaigns.Where(c => c.SentCount > 0).Average(c => (double)c.UniqueClickCount / c.SentCount * 100)
                    : 0,
                TotalBudget = campaigns.Sum(c => c.Budget ?? 0),
                TotalRevenue = campaigns.Sum(c => c.Revenue ?? 0),
                OverallROI = campaigns.Sum(c => c.Budget ?? 0) > 0
                    ? (double)(campaigns.Sum(c => c.Revenue ?? 0) - campaigns.Sum(c => c.Budget ?? 0)) / (double)campaigns.Sum(c => c.Budget ?? 0) * 100
                    : 0,
                RecentCampaigns = campaigns
                    .OrderByDescending(c => c.CreatedAt)
                    .Take(5)
                    .Select(c => MapToDto(c))
                    .ToList()
            };

            return Ok(dashboard);
        }

        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetMarketingStats()
        {
            var campaigns = await _context.MarketingCampaigns.ToListAsync();
            var lists = await _context.MarketingLists.ToListAsync();

            return Ok(new
            {
                TotalCampaigns = campaigns.Count,
                TotalLists = lists.Count,
                TotalSent = campaigns.Sum(c => c.SentCount),
                TotalOpened = campaigns.Sum(c => c.UniqueOpenCount),
                TotalClicked = campaigns.Sum(c => c.UniqueClickCount),
                AvgOpenRate = campaigns.Any(c => c.SentCount > 0)
                    ? campaigns.Where(c => c.SentCount > 0).Average(c => (double)c.UniqueOpenCount / c.SentCount * 100)
                    : 0,
                AvgClickRate = campaigns.Any(c => c.SentCount > 0)
                    ? campaigns.Where(c => c.SentCount > 0).Average(c => (double)c.UniqueClickCount / c.SentCount * 100)
                    : 0
            });
        }

        // =============================================
        // HELPER METHODS
        // =============================================

        private static CampaignDto MapToDto(MarketingCampaign c)
        {
            var sent = c.SentCount > 0 ? c.SentCount : 1;
            return new CampaignDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                Type = c.Type,
                Status = c.Status,
                Subject = c.Subject,
                ScheduledFor = c.ScheduledFor,
                StartedAt = c.StartedAt,
                CompletedAt = c.CompletedAt,
                MarketingListId = c.MarketingListId,
                MarketingListName = c.MarketingList?.Name,
                RecipientCount = c.RecipientCount,
                SentCount = c.SentCount,
                OpenCount = c.OpenCount,
                UniqueOpenCount = c.UniqueOpenCount,
                ClickCount = c.ClickCount,
                UniqueClickCount = c.UniqueClickCount,
                BounceCount = c.BounceCount,
                UnsubscribeCount = c.UnsubscribeCount,
                OpenRate = c.SentCount > 0 ? (double)c.UniqueOpenCount / c.SentCount * 100 : 0,
                ClickRate = c.SentCount > 0 ? (double)c.UniqueClickCount / c.SentCount * 100 : 0,
                BounceRate = c.SentCount > 0 ? (double)c.BounceCount / c.SentCount * 100 : 0,
                UnsubscribeRate = c.SentCount > 0 ? (double)c.UnsubscribeCount / c.SentCount * 100 : 0,
                Budget = c.Budget,
                Revenue = c.Revenue,
                ConversionCount = c.ConversionCount,
                ROI = c.Budget > 0 ? (double)((c.Revenue ?? 0) - c.Budget.Value) / (double)c.Budget.Value * 100 : null,
                IsABTest = c.IsABTest,
                WinningVariant = c.WinningVariant,
                CreatedAt = c.CreatedAt
            };
        }
    }

    // =============================================
    // Additional DTOs
    // =============================================
    public class ScheduleDto
    {
        public DateTime ScheduledFor { get; set; }
        public string? Timezone { get; set; }
    }

    public class UnsubscribeDto
    {
        public string Email { get; set; } = string.Empty;
        public string? Reason { get; set; }
        public int? CampaignId { get; set; }
    }

    public class AddSuppressionDto
    {
        public string Email { get; set; } = string.Empty;
        public string? Type { get; set; }
        public string? Reason { get; set; }
    }
}
