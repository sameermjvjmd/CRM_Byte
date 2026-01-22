using CRM.Api.DTOs.Search;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CRM.Api.Services.Search
{
    public interface ISearchService
    {
        Task<QueryResult> ExecuteQueryAsync(QueryDefinition query);
        Task<List<GlobalSearchResult>> GlobalSearchAsync(string searchQuery, string? scope, int maxResults);
        Task<List<SavedSearchDto>> GetSavedSearchesAsync(int userId, string? entityType);
        Task<SavedSearchDto> SaveSearchAsync(SavedSearchDto dto, int userId);
        Task DeleteSavedSearchAsync(int id, int userId);
        Task RecordSearchHistoryAsync(int userId, string query, string? entityType, int resultCount);
    }
}
