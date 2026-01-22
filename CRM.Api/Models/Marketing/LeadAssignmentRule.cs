using System.ComponentModel.DataAnnotations;

namespace CRM.Api.Models.Marketing
{
    public class LeadAssignmentRule
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public int Priority { get; set; } = 1; // Lower = higher priority

        [Required]
        [StringLength(50)]
        public string AssignmentType { get; set; } = "RoundRobin";
        // Types: RoundRobin, Territory, ScoreBased, Workload

        [StringLength(1000)]
        public string? Criteria { get; set; } // JSON: {minScore, maxScore, territory, source, etc}

        [StringLength(1000)]
        public string AssignToUserIds { get; set; } = "[]"; // JSON array of user IDs

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastModifiedAt { get; set; }

        public int? LastAssignedIndex { get; set; } = 0; // For round-robin tracking
    }
}
