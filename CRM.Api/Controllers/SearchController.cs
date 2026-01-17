using CRM.Api.DTOs.Search;
using CRM.Api.DTOs;
using CRM.Api.Services.Search;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SearchController : ControllerBase
    {
        private readonly ISearchService _searchService;
        private readonly CRM.Api.Data.ApplicationDbContext _context;

        public SearchController(ISearchService searchService, CRM.Api.Data.ApplicationDbContext context)
        {
            _searchService = searchService;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<SearchResultDto>>> GlobalSearch([FromQuery] string query)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int userId = 0;
            if (int.TryParse(userIdString, out var parsedId))
            {
                userId = parsedId;
            }

            var results = await _searchService.GlobalSearchAsync(query, userId);
            return Ok(results);
        }

        // GET: api/search/saved
        [HttpGet("saved")]
        public async Task<ActionResult<IEnumerable<SavedSearchDto>>> GetSavedSearches()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdString, out var userId)) return Unauthorized();

            var savedSearches = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync(
                System.Linq.Queryable.Where(_context.SavedSearches, s => s.UserId == userId || s.IsPublic)
            );

            var dtos = new List<SavedSearchDto>();
            foreach (var s in savedSearches)
            {
                var container = System.Text.Json.JsonSerializer.Deserialize<SavedSearchCriteriaContainer>(s.CriteriaJson);
                dtos.Add(new SavedSearchDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    EntityType = s.EntityType,
                    Description = s.Description,
                    IsPublic = s.IsPublic,
                    CreatedAt = s.CreatedAt,
                    Criteria = container?.Criteria ?? new List<SearchCriteriaDto>(),
                    MatchType = container?.MatchType ?? "All"
                });
            }

            return Ok(dtos.OrderByDescending(d => d.CreatedAt));
        }

        // POST: api/search/saved
        [HttpPost("saved")]
        public async Task<ActionResult<SavedSearchDto>> CreateSavedSearch(CreateSavedSearchDto dto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdString, out var userId)) return Unauthorized();

            var container = new SavedSearchCriteriaContainer
            {
                Criteria = dto.Criteria,
                MatchType = dto.MatchType
            };

            var savedSearch = new CRM.Api.Models.SavedSearch
            {
                Name = dto.Name,
                EntityType = dto.EntityType,
                Description = dto.Description,
                IsPublic = dto.IsPublic,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                CriteriaJson = System.Text.Json.JsonSerializer.Serialize(container)
            };

            _context.SavedSearches.Add(savedSearch);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSavedSearches), new { id = savedSearch.Id }, new SavedSearchDto
            {
                Id = savedSearch.Id,
                Name = savedSearch.Name,
                EntityType = savedSearch.EntityType,
                Description = savedSearch.Description,
                IsPublic = savedSearch.IsPublic,
                CreatedAt = savedSearch.CreatedAt,
                Criteria = dto.Criteria,
                MatchType = dto.MatchType
            });
        }

        // DELETE: api/search/saved/5
        [HttpDelete("saved/{id}")]
        public async Task<IActionResult> DeleteSavedSearch(int id)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdString, out var userId)) return Unauthorized();

            var savedSearch = await _context.SavedSearches.FindAsync(id);
            if (savedSearch == null) return NotFound();

            if (savedSearch.UserId != userId) return Forbid();

            _context.SavedSearches.Remove(savedSearch);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
