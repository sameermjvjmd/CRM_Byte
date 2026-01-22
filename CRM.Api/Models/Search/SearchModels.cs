using System.ComponentModel.DataAnnotations;

namespace CRM.Api.Models.Search
{
    public class SavedSearch
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Description { get; set; }

        [Required]
        [StringLength(50)]
        public string EntityType { get; set; } = "Contact";
        // Types: Contact, Company, Opportunity, Activity, All

        [Required]
        public string QueryJson { get; set; } = "{}";
        // JSON representation of query conditions

        public bool IsShared { get; set; } = false;
        public bool IsDefault { get; set; } = false;
        public bool IsFavorite { get; set; } = false;

        public int CreatedByUserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastModifiedAt { get; set; }
        public DateTime? LastUsedAt { get; set; }
        public int UseCount { get; set; } = 0;
    }

    public class SearchHistory
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        [Required]
        [StringLength(500)]
        public string Query { get; set; } = string.Empty;

        [StringLength(50)]
        public string? EntityType { get; set; }

        public DateTime SearchedAt { get; set; } = DateTime.UtcNow;
        public int ResultCount { get; set; } = 0;
    }

    public class FilterPreset
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Description { get; set; }

        [Required]
        [StringLength(50)]
        public string EntityType { get; set; } = "Contact";

        [Required]
        public string FilterJson { get; set; } = "{}";

        public bool IsSystem { get; set; } = false;
        public bool IsShared { get; set; } = false;

        public int? CreatedByUserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
