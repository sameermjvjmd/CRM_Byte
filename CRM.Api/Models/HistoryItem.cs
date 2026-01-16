using System.ComponentModel.DataAnnotations;

namespace CRM.Api.Models
{
    public class HistoryItem
    {
        public int Id { get; set; }

        [Required]
        public string Type { get; set; } = "Note"; // Call, Meeting, To-Do, Note, EmailSent
        
        public string Result { get; set; } = "Completed"; // Completed, Attempted, Left Message, etc.
        
        [Required]
        [StringLength(200)]
        public string Regarding { get; set; } = string.Empty;

        public DateTime Date { get; set; } = DateTime.UtcNow;
        public int DurationMinutes { get; set; }

        public string? Details { get; set; }
        
        public int? ContactId { get; set; }
        public Contact? Contact { get; set; }

        public int? CompanyId { get; set; }
        public Company? Company { get; set; }
        
        public int? OpportunityId { get; set; }
        public Opportunity? Opportunity { get; set; }
    }
}
