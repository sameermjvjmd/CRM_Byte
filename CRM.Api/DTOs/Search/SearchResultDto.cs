namespace CRM.Api.DTOs.Search
{
    public class SearchResultDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Subtitle { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "Contact", "Company", "Opportunity"
        public string Url { get; set; } = string.Empty; // Frontend route e.g. /contacts/123
        public string? Icon { get; set; }
    }
}
