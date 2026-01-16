using System.ComponentModel.DataAnnotations;

namespace CRM.Api.Models
{
    public class StageHistory
    {
        public int Id { get; set; }

        public int OpportunityId { get; set; }
        public Opportunity Opportunity { get; set; } = null!;

        [Required]
        [StringLength(100)]
        public string FromStage { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string ToStage { get; set; } = string.Empty;

        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

        [StringLength(500)]
        public string? Reason { get; set; } // Why the stage was changed

        public int? ChangedByUserId { get; set; }
        public User? ChangedBy { get; set; }

        public int DaysInPreviousStage { get; set; } = 0;
    }
}
