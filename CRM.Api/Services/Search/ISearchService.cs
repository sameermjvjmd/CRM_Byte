using CRM.Api.DTOs.Search;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CRM.Api.Services.Search
{
    public interface ISearchService
    {
        Task<List<SearchResultDto>> GlobalSearchAsync(string query, int userId);
    }
}
