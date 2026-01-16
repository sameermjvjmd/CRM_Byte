namespace CRM.Api.DTOs
{
    public class SearchCriteriaDto
    {
        public string Field { get; set; } = string.Empty;
        public string Operator { get; set; } = string.Empty; // e.g., "Contains", "Equals", "Starts With", "Does Not Contain"
        public string Value { get; set; } = string.Empty;
    }

    public class AdvancedSearchRequestDto
    {
        public string EntityType { get; set; } = "Contacts";
        public List<SearchCriteriaDto> Criteria { get; set; } = new List<SearchCriteriaDto>();
        public string MatchType { get; set; } = "All"; // "All" (AND) or "Any" (OR)
    }
}
