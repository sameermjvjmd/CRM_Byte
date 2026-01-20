using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CRM.Api.Models
{
    public class SalesQuota
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }
        
        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        // "Monthly", "Quarterly", "Yearly"
        [StringLength(20)]
        public string PeriodType { get; set; } = "Monthly";

        public int FiscalYear { get; set; }
        
        // 1-12 for Monthly, 1-4 for Quarterly, 0 for Yearly
        public int PeriodNumber { get; set; } 

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastModifiedAt { get; set; } = DateTime.UtcNow;
    }
}
