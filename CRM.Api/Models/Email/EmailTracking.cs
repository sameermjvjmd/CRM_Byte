using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CRM.Api.Models.Email
{
    public class EmailTracking
    {
        [Key, ForeignKey("SentEmail")]
        public int SentEmailId { get; set; }
        
        public int OpenCount { get; set; }
        public DateTime? FirstOpenedAt { get; set; }
        public DateTime? LastOpenedAt { get; set; }
        
        public int ClickCount { get; set; }
        public string? ClickedLinks { get; set; } // JSON array of clicked URLs
        
        public virtual SentEmail SentEmail { get; set; } = null!;
    }
}
