using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CRM.Api.Services.Search;
using CRM.Api.DTOs.Search;
using System.Security.Claims;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SearchController : ControllerBase
    {
        private readonly ISearchService _searchService;
        private readonly ILogger<SearchController> _logger;

        public SearchController(ISearchService searchService, ILogger<SearchController> logger)
        {
            _searchService = searchService;
            _logger = logger;
        }

        private int GetUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdStr, out int uid) ? uid : 0;
        }

        // =============================================
        // ADVANCED QUERY
        // =============================================

        [HttpPost("query")]
        public async Task<ActionResult<QueryResult>> ExecuteQuery([FromBody] QueryDefinition query)
        {
            try
            {
                var result = await _searchService.ExecuteQueryAsync(query);
                
                // Record search history
                await _searchService.RecordSearchHistoryAsync(
                    GetUserId(), 
                    $"Advanced query on {query.EntityType}", 
                    query.EntityType, 
                    result.TotalCount
                );

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing query");
                return BadRequest(new { error = ex.Message });
            }
        }

        // =============================================
        // GLOBAL SEARCH
        // =============================================

        [HttpGet("global")]
        public async Task<ActionResult<List<GlobalSearchResult>>> GlobalSearch(
            [FromQuery] string q,
            [FromQuery] string? scope = null,
            [FromQuery] int maxResults = 20)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(q))
                {
                    return Ok(new List<GlobalSearchResult>());
                }

                var results = await _searchService.GlobalSearchAsync(q, scope, maxResults);

                // Record search history
                await _searchService.RecordSearchHistoryAsync(
                    GetUserId(),
                    q,
                    scope,
                    results.Count
                );

                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing global search");
                return BadRequest(new { error = ex.Message });
            }
        }

        // =============================================
        // SAVED SEARCHES
        // =============================================

        [HttpGet("saved")]
        public async Task<ActionResult<List<SavedSearchDto>>> GetSavedSearches(
            [FromQuery] string? entityType = null)
        {
            try
            {
                var searches = await _searchService.GetSavedSearchesAsync(GetUserId(), entityType);
                return Ok(searches);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting saved searches");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("saved")]
        public async Task<ActionResult<SavedSearchDto>> SaveSearch([FromBody] SavedSearchDto dto)
        {
            try
            {
                var result = await _searchService.SaveSearchAsync(dto, GetUserId());
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving search");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("saved/{id}")]
        public async Task<ActionResult<SavedSearchDto>> UpdateSavedSearch(int id, [FromBody] SavedSearchDto dto)
        {
            try
            {
                dto.Id = id;
                var result = await _searchService.SaveSearchAsync(dto, GetUserId());
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating saved search");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("saved/{id}")]
        public async Task<IActionResult> DeleteSavedSearch(int id)
        {
            try
            {
                await _searchService.DeleteSavedSearchAsync(id, GetUserId());
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting saved search");
                return BadRequest(new { error = ex.Message });
            }
        }

        // =============================================
        // FILTER PRESETS
        // =============================================

        [HttpGet("presets")]
        public async Task<ActionResult<List<FilterPresetDto>>> GetFilterPresets(
            [FromQuery] string? entityType = null)
        {
            try
            {
                // Return predefined presets
                var presets = GetPredefinedPresets(entityType);
                return Ok(presets);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting filter presets");
                return BadRequest(new { error = ex.Message });
            }
        }

        private List<FilterPresetDto> GetPredefinedPresets(string? entityType)
        {
            var presets = new List<FilterPresetDto>();

            if (entityType == null || entityType == "Contact")
            {
                presets.AddRange(new[]
                {
                    new FilterPresetDto
                    {
                        Name = "Hot Leads",
                        Description = "Contacts with lead score ≥ 70",
                        EntityType = "Contact",
                        IsSystem = true,
                        Filter = new QueryDefinition
                        {
                            EntityType = "Contact",
                            Conditions = new List<FilterCondition>
                            {
                                new FilterCondition
                                {
                                    Field = "LeadScore",
                                    Operator = "greaterThanOrEqual",
                                    Value = 70
                                }
                            }
                        }
                    },
                    new FilterPresetDto
                    {
                        Name = "Recent Contacts",
                        Description = "Contacts created in the last 30 days",
                        EntityType = "Contact",
                        IsSystem = true,
                        Filter = new QueryDefinition
                        {
                            EntityType = "Contact",
                            Conditions = new List<FilterCondition>
                            {
                                new FilterCondition
                                {
                                    Field = "CreatedAt",
                                    Operator = "greaterThanOrEqual",
                                    Value = DateTime.UtcNow.AddDays(-30)
                                }
                            }
                        }
                    },
                    new FilterPresetDto
                    {
                        Name = "Active Contacts",
                        Description = "Contacts with Active status",
                        EntityType = "Contact",
                        IsSystem = true,
                        Filter = new QueryDefinition
                        {
                            EntityType = "Contact",
                            Conditions = new List<FilterCondition>
                            {
                                new FilterCondition
                                {
                                    Field = "Status",
                                    Operator = "equals",
                                    Value = "Active"
                                }
                            }
                        }
                    }
                });
            }

            if (entityType == null || entityType == "Opportunity")
            {
                presets.AddRange(new[]
                {
                    new FilterPresetDto
                    {
                        Name = "High-Value Deals",
                        Description = "Opportunities with amount ≥ $50,000",
                        EntityType = "Opportunity",
                        IsSystem = true,
                        Filter = new QueryDefinition
                        {
                            EntityType = "Opportunity",
                            Conditions = new List<FilterCondition>
                            {
                                new FilterCondition
                                {
                                    Field = "Amount",
                                    Operator = "greaterThanOrEqual",
                                    Value = 50000
                                }
                            }
                        }
                    },
                    new FilterPresetDto
                    {
                        Name = "Closing This Month",
                        Description = "Opportunities expected to close this month",
                        EntityType = "Opportunity",
                        IsSystem = true,
                        Filter = new QueryDefinition
                        {
                            EntityType = "Opportunity",
                            Conditions = new List<FilterCondition>
                            {
                                new FilterCondition
                                {
                                    Field = "ExpectedCloseDate",
                                    Operator = "greaterThanOrEqual",
                                    Value = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1)
                                },
                                new FilterCondition
                                {
                                    Field = "ExpectedCloseDate",
                                    Operator = "lessThan",
                                    Value = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1).AddMonths(1),
                                    Logic = "AND"
                                }
                            }
                        }
                    }
                });
            }

            if (entityType == null || entityType == "Activity")
            {
                presets.AddRange(new[]
                {
                    new FilterPresetDto
                    {
                        Name = "Overdue Activities",
                        Description = "Activities past their due date",
                        EntityType = "Activity",
                        IsSystem = true,
                        Filter = new QueryDefinition
                        {
                            EntityType = "Activity",
                            Conditions = new List<FilterCondition>
                            {
                                new FilterCondition
                                {
                                    Field = "EndTime",
                                    Operator = "lessThan",
                                    Value = DateTime.UtcNow
                                },
                                new FilterCondition
                                {
                                    Field = "IsCompleted",
                                    Operator = "equals",
                                    Value = false,
                                    Logic = "AND"
                                }
                            }
                        }
                    }
                });
            }

            return presets;
        }
    }
}
