using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CRM.Api.Models
{
    public class Document
    {
        public int Id { get; set; }

        [Required]
        public string FileName { get; set; } = string.Empty;

        [Required]
        public string StoredFileName { get; set; } = string.Empty; // Guid-based name on disk

        public string ContentType { get; set; } = "application/octet-stream";
        public long FileSize { get; set; }

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        // Relationships (Optional links to entities)
        public int? ContactId { get; set; }
        public Contact? Contact { get; set; }

        public int? CompanyId { get; set; }
        public Company? Company { get; set; }

        public int? GroupId { get; set; }
        public Group? Group { get; set; }

        public int? OpportunityId { get; set; }
        public Opportunity? Opportunity { get; set; }
    }
}
