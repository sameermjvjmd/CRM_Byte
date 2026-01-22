namespace CRM.Api.DTOs.Search
{
    public class QueryDefinition
    {
        public string EntityType { get; set; } = "Contact";
        public List<FilterCondition> Conditions { get; set; } = new();
        public SortDefinition? Sort { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    public class FilterCondition
    {
        public string Field { get; set; } = string.Empty;
        public string Operator { get; set; } = "equals";
        // Operators: equals, notEquals, contains, startsWith, endsWith, 
        // greaterThan, lessThan, greaterThanOrEqual, lessThanOrEqual, between,
        // isEmpty, isNotEmpty, isOneOf, isNotOneOf, before, after, inLast, inNext
        public object? Value { get; set; }
        public object? Value2 { get; set; } // For 'between' operator
        public string Logic { get; set; } = "AND"; // AND or OR
        public List<FilterCondition>? Group { get; set; } // For nested conditions
    }

    public class SortDefinition
    {
        public string Field { get; set; } = "CreatedAt";
        public string Direction { get; set; } = "desc"; // asc or desc
    }

    public class QueryResult
    {
        public List<object> Results { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class GlobalSearchRequest
    {
        public string Query { get; set; } = string.Empty;
        public string? Scope { get; set; } // Contact, Company, Opportunity, Activity, or null for all
        public int MaxResults { get; set; } = 20;
    }

    public class GlobalSearchResult
    {
        public string EntityType { get; set; } = string.Empty;
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public string? Description { get; set; }
        public Dictionary<string, string> Metadata { get; set; } = new();
    }

    public class SavedSearchDto
    {
        public int? Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string EntityType { get; set; } = "Contact";
        public QueryDefinition Query { get; set; } = new();
        public bool IsShared { get; set; }
        public bool IsDefault { get; set; }
        public bool IsFavorite { get; set; }
        public int? UseCount { get; set; }
        public DateTime? LastUsedAt { get; set; }
    }

    public class FilterPresetDto
    {
        public int? Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string EntityType { get; set; } = "Contact";
        public QueryDefinition Filter { get; set; } = new();
        public bool IsSystem { get; set; }
    }

    // Legacy support for GroupsController
    public class SavedSearchCriteriaContainer
    {
        public List<CRM.Api.DTOs.SearchCriteriaDto> Criteria { get; set; } = new();
        public string MatchType { get; set; } = "All";
    }
}
