using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;
using CRM.Api.DTOs.Search;
using System.Linq.Expressions;
using System.Reflection;
using System.Text.Json;

namespace CRM.Api.Services.Search
{
    public class SearchService : ISearchService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SearchService> _logger;

        public SearchService(ApplicationDbContext context, ILogger<SearchService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<QueryResult> ExecuteQueryAsync(QueryDefinition query)
        {
            try
            {
                var results = query.EntityType switch
                {
                    "Contact" => await ExecuteContactQueryAsync(query),
                    "Company" => await ExecuteCompanyQueryAsync(query),
                    "Opportunity" => await ExecuteOpportunityQueryAsync(query),
                    "Activity" => await ExecuteActivityQueryAsync(query),
                    _ => throw new ArgumentException($"Unsupported entity type: {query.EntityType}")
                };

                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing query for entity type: {EntityType}", query.EntityType);
                throw;
            }
        }

        private async Task<QueryResult> ExecuteContactQueryAsync(QueryDefinition query)
        {
            var queryable = _context.Contacts.AsQueryable();

            // Apply filters
            queryable = ApplyFilters(queryable, query.Conditions);

            // Get total count
            var totalCount = await queryable.CountAsync();

            // Apply sorting
            if (query.Sort != null)
            {
                queryable = ApplySort(queryable, query.Sort.Field, query.Sort.Direction);
            }
            else
            {
                queryable = queryable.OrderByDescending(c => c.CreatedAt);
            }

            // Apply pagination
            var results = await queryable
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(c => new
                {
                    c.Id,
                    c.FirstName,
                    c.LastName,
                    c.Email,
                    c.Phone,
                    c.CompanyId,
                    c.JobTitle,
                    c.Status,
                    c.LeadScore,
                    c.LeadSource,
                    Territory = c.State,
                    c.CreatedAt
                })
                .ToListAsync();

            return new QueryResult
            {
                Results = results.Cast<object>().ToList(),
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize)
            };
        }

        private async Task<QueryResult> ExecuteCompanyQueryAsync(QueryDefinition query)
        {
            var queryable = _context.Companies.AsQueryable();
            queryable = ApplyFilters(queryable, query.Conditions);
            var totalCount = await queryable.CountAsync();

            if (query.Sort != null)
            {
                queryable = ApplySort(queryable, query.Sort.Field, query.Sort.Direction);
            }

            var results = await queryable
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return new QueryResult
            {
                Results = results.Cast<object>().ToList(),
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize)
            };
        }

        private async Task<QueryResult> ExecuteOpportunityQueryAsync(QueryDefinition query)
        {
            var queryable = _context.Opportunities.AsQueryable();
            queryable = ApplyFilters(queryable, query.Conditions);
            var totalCount = await queryable.CountAsync();

            if (query.Sort != null)
            {
                queryable = ApplySort(queryable, query.Sort.Field, query.Sort.Direction);
            }

            var results = await queryable
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return new QueryResult
            {
                Results = results.Cast<object>().ToList(),
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize)
            };
        }

        private async Task<QueryResult> ExecuteActivityQueryAsync(QueryDefinition query)
        {
            var queryable = _context.Activities.AsQueryable();
            queryable = ApplyFilters(queryable, query.Conditions);
            var totalCount = await queryable.CountAsync();

            if (query.Sort != null)
            {
                queryable = ApplySort(queryable, query.Sort.Field, query.Sort.Direction);
            }

            var results = await queryable
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToListAsync();

            return new QueryResult
            {
                Results = results.Cast<object>().ToList(),
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize)
            };
        }

        private IQueryable<T> ApplyFilters<T>(IQueryable<T> queryable, List<FilterCondition> conditions)
        {
            foreach (var condition in conditions)
            {
                if (condition.Group != null && condition.Group.Any())
                {
                    // Handle grouped conditions (nested)
                    queryable = ApplyFilters(queryable, condition.Group);
                }
                else
                {
                    queryable = ApplyCondition(queryable, condition);
                }
            }

            return queryable;
        }

        private IQueryable<T> ApplyCondition<T>(IQueryable<T> queryable, FilterCondition condition)
        {
            var parameter = Expression.Parameter(typeof(T), "x");
            
            try
            {
                var property = Expression.Property(parameter, condition.Field);
                Expression? filterExpression = null;

                filterExpression = condition.Operator.ToLower() switch
                {
                    "equals" => BuildEqualsExpression(property, condition.Value),
                    "notequals" => Expression.Not(BuildEqualsExpression(property, condition.Value)),
                    "contains" => BuildContainsExpression(property, condition.Value),
                    "startswith" => BuildStartsWithExpression(property, condition.Value),
                    "endswith" => BuildEndsWithExpression(property, condition.Value),
                    "greaterthan" => Expression.GreaterThan(property, Expression.Constant(Convert.ChangeType(condition.Value, property.Type))),
                    "lessthan" => Expression.LessThan(property, Expression.Constant(Convert.ChangeType(condition.Value, property.Type))),
                    "greaterthanorequal" => Expression.GreaterThanOrEqual(property, Expression.Constant(Convert.ChangeType(condition.Value, property.Type))),
                    "lessthanorequal" => Expression.LessThanOrEqual(property, Expression.Constant(Convert.ChangeType(condition.Value, property.Type))),
                    "isempty" => BuildIsEmptyExpression(property),
                    "isnotempty" => Expression.Not(BuildIsEmptyExpression(property)),
                    _ => BuildEqualsExpression(property, condition.Value)
                };

                if (filterExpression != null)
                {
                    var lambda = Expression.Lambda<Func<T, bool>>(filterExpression, parameter);
                    queryable = queryable.Where(lambda);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to apply condition: {Field} {Operator} {Value}", condition.Field, condition.Operator, condition.Value);
            }

            return queryable;
        }

        private Expression BuildEqualsExpression(MemberExpression property, object? value)
        {
            var constant = Expression.Constant(Convert.ChangeType(value, property.Type), property.Type);
            return Expression.Equal(property, constant);
        }

        private Expression BuildContainsExpression(MemberExpression property, object? value)
        {
            var method = typeof(string).GetMethod("Contains", new[] { typeof(string) });
            var constant = Expression.Constant(value?.ToString() ?? "", typeof(string));
            return Expression.Call(property, method!, constant);
        }

        private Expression BuildStartsWithExpression(MemberExpression property, object? value)
        {
            var method = typeof(string).GetMethod("StartsWith", new[] { typeof(string) });
            var constant = Expression.Constant(value?.ToString() ?? "", typeof(string));
            return Expression.Call(property, method!, constant);
        }

        private Expression BuildEndsWithExpression(MemberExpression property, object? value)
        {
            var method = typeof(string).GetMethod("EndsWith", new[] { typeof(string) });
            var constant = Expression.Constant(value?.ToString() ?? "", typeof(string));
            return Expression.Call(property, method!, constant);
        }

        private Expression BuildIsEmptyExpression(MemberExpression property)
        {
            if (property.Type == typeof(string))
            {
                var method = typeof(string).GetMethod("IsNullOrEmpty", new[] { typeof(string) });
                return Expression.Call(method!, property);
            }
            return Expression.Equal(property, Expression.Constant(null));
        }

        private IQueryable<T> ApplySort<T>(IQueryable<T> queryable, string field, string direction)
        {
            var parameter = Expression.Parameter(typeof(T), "x");
            var property = Expression.Property(parameter, field);
            var lambda = Expression.Lambda(property, parameter);

            var methodName = direction.ToLower() == "asc" ? "OrderBy" : "OrderByDescending";
            var method = typeof(Queryable).GetMethods()
                .First(m => m.Name == methodName && m.GetParameters().Length == 2)
                .MakeGenericMethod(typeof(T), property.Type);

            return (IQueryable<T>)method.Invoke(null, new object[] { queryable, lambda })!;
        }

        public async Task<List<GlobalSearchResult>> GlobalSearchAsync(string searchQuery, string? scope, int maxResults)
        {
            var results = new List<GlobalSearchResult>();

            if (string.IsNullOrWhiteSpace(searchQuery))
                return results;

            var query = searchQuery.ToLower();

            // Search Contacts
            if (scope == null || scope == "Contact")
            {
                var contacts = await _context.Contacts
                    .Where(c => (c.FirstName != null && c.FirstName.ToLower().Contains(query)) ||
                               (c.LastName != null && c.LastName.ToLower().Contains(query)) ||
                               (c.Email != null && c.Email.ToLower().Contains(query)) ||
                               (c.Phone != null && c.Phone.Contains(query)))
                    .Take(maxResults / 4)
                    .Select(c => new GlobalSearchResult
                    {
                        EntityType = "Contact",
                        Id = c.Id,
                        Title = $"{c.FirstName} {c.LastName}",
                        Subtitle = c.Email,
                        Description = c.JobTitle,
                        Metadata = new Dictionary<string, string>
                        {
                            { "Phone", c.Phone ?? "" },
                            { "Status", c.Status ?? "" }
                        }
                    })
                    .ToListAsync();

                results.AddRange(contacts);
            }

            // Search Companies
            if (scope == null || scope == "Company")
            {
                var companies = await _context.Companies
                    .Where(c => (c.Name != null && c.Name.ToLower().Contains(query)) ||
                               (c.Website != null && c.Website.ToLower().Contains(query)))
                    .Take(maxResults / 4)
                    .Select(c => new GlobalSearchResult
                    {
                        EntityType = "Company",
                        Id = c.Id,
                        Title = c.Name ?? "",
                        Subtitle = c.Industry,
                        Description = c.Website,
                        Metadata = new Dictionary<string, string>
                        {
                            { "Phone", c.Phone ?? "" }
                        }
                    })
                    .ToListAsync();

                results.AddRange(companies);
            }

            // Search Opportunities
            if (scope == null || scope == "Opportunity")
            {
                var opportunities = await _context.Opportunities
                    .Where(o => (o.Name != null && o.Name.ToLower().Contains(query)) ||
                               (o.Description != null && o.Description.ToLower().Contains(query)))
                    .Take(maxResults / 4)
                    .Select(o => new GlobalSearchResult
                    {
                        EntityType = "Opportunity",
                        Id = o.Id,
                        Title = o.Name ?? "",
                        Subtitle = $"${o.Amount:N0}",
                        Description = o.Stage,
                        Metadata = new Dictionary<string, string>
                        {
                            { "Stage", o.Stage ?? "" },
                            { "Probability", $"{o.Probability}%" }
                        }
                    })
                    .ToListAsync();

                results.AddRange(opportunities);
            }

            // Search Activities
            if (scope == null || scope == "Activity")
            {
                var activities = await _context.Activities
                    .Where(a => (a.Subject != null && a.Subject.ToLower().Contains(query)) ||
                               (a.Notes != null && a.Notes.ToLower().Contains(query)))
                    .Take(maxResults / 4)
                    .Select(a => new GlobalSearchResult
                    {
                        EntityType = "Activity",
                        Id = a.Id,
                        Title = a.Subject ?? "",
                        Subtitle = a.Type,
                        Description = a.Notes,
                        Metadata = new Dictionary<string, string>
                        {
                            { "Type", a.Type ?? "" },
                            { "Priority", a.Priority ?? "" }
                        }
                    })
                    .ToListAsync();

                results.AddRange(activities);
            }

            return results.Take(maxResults).ToList();
        }

        public async Task<List<SavedSearchDto>> GetSavedSearchesAsync(int userId, string? entityType)
        {
            var query = _context.SearchSavedSearches
                .Where(s => s.CreatedByUserId == userId || s.IsShared);

            if (!string.IsNullOrEmpty(entityType))
            {
                query = query.Where(s => s.EntityType == entityType);
            }

            var searches = await query
                .OrderByDescending(s => s.IsFavorite)
                .ThenByDescending(s => s.LastUsedAt)
                .ToListAsync();

            return searches.Select(s => new SavedSearchDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                EntityType = s.EntityType,
                Query = JsonSerializer.Deserialize<QueryDefinition>(s.QueryJson) ?? new QueryDefinition(),
                IsShared = s.IsShared,
                IsDefault = s.IsDefault,
                IsFavorite = s.IsFavorite,
                UseCount = s.UseCount,
                LastUsedAt = s.LastUsedAt
            }).ToList();
        }

        public async Task<SavedSearchDto> SaveSearchAsync(SavedSearchDto dto, int userId)
        {
            var search = new Models.Search.SavedSearch
            {
                Name = dto.Name,
                Description = dto.Description,
                EntityType = dto.EntityType,
                QueryJson = JsonSerializer.Serialize(dto.Query),
                IsShared = dto.IsShared,
                IsDefault = dto.IsDefault,
                IsFavorite = dto.IsFavorite,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            if (dto.Id.HasValue)
            {
                var existing = await _context.SearchSavedSearches.FindAsync(dto.Id.Value);
                if (existing != null && existing.CreatedByUserId == userId)
                {
                    existing.Name = dto.Name;
                    existing.Description = dto.Description;
                    existing.QueryJson = JsonSerializer.Serialize(dto.Query);
                    existing.IsShared = dto.IsShared;
                    existing.IsDefault = dto.IsDefault;
                    existing.IsFavorite = dto.IsFavorite;
                    existing.LastModifiedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    return dto;
                }
            }

            _context.SearchSavedSearches.Add(search);
            await _context.SaveChangesAsync();

            dto.Id = search.Id;
            return dto;
        }

        public async Task DeleteSavedSearchAsync(int id, int userId)
        {
            var search = await _context.SearchSavedSearches.FindAsync(id);
            if (search != null && search.CreatedByUserId == userId)
            {
                _context.SearchSavedSearches.Remove(search);
                await _context.SaveChangesAsync();
            }
        }

        public async Task RecordSearchHistoryAsync(int userId, string query, string? entityType, int resultCount)
        {
            var history = new Models.Search.SearchHistory
            {
                UserId = userId,
                Query = query,
                EntityType = entityType,
                SearchedAt = DateTime.UtcNow,
                ResultCount = resultCount
            };

            _context.SearchHistories.Add(history);
            await _context.SaveChangesAsync();
        }
    }
}
