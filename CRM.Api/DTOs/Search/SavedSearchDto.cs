using System.ComponentModel.DataAnnotations;
using CRM.Api.DTOs;

namespace CRM.Api.DTOs.Search
{
    public class SavedSearchDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
        public DateTime CreatedAt { get; set; }
        // We return the deserialized criteria
        public List<SearchCriteriaDto> Criteria { get; set; } = new();
        public string MatchType { get; set; } = "All"; // Saved searches need to store MatchType too
    }

    public class CreateSavedSearchDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string EntityType { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;
        public bool IsPublic { get; set; }

        [Required]
        public List<SearchCriteriaDto> Criteria { get; set; } = new();
        public string MatchType { get; set; } = "All";
    }

    public class SavedSearchCriteriaContainer
    {
        public List<SearchCriteriaDto> Criteria { get; set; } = new();
        public string MatchType { get; set; } = "All";
    }
}
