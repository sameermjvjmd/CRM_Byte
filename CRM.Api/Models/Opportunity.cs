using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CRM.Api.Models
{
    public class Opportunity
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [StringLength(50)]
        public string Stage { get; set; } = "Lead";
        // Stages: Lead, Qualified, Proposal, Negotiation, Closed Won, Closed Lost

        public double Probability { get; set; } = 10; // Percentage (0-100)

        public DateTime ExpectedCloseDate { get; set; }

        // =============================================
        // Actual Close & Win/Loss Tracking
        // =============================================
        public DateTime? ActualCloseDate { get; set; }
        
        public DateTime? WonDate { get; set; }
        public DateTime? LostDate { get; set; }
        
        [StringLength(100)]
        public string? WinReason { get; set; } // Price, Features, Relationship, etc.
        
        [StringLength(100)]
        public string? LostReason { get; set; } // Price, Competition, Timing, No Budget, etc.
        
        [StringLength(500)]
        public string? WinLossNotes { get; set; } // Detailed explanation

        // =============================================
        // Stage & Duration Tracking
        // =============================================
        public DateTime? LastStageChangeDate { get; set; }
        public int DaysInCurrentStage { get; set; } = 0;
        
        // Total days from Lead to Close
        public int TotalDaysToClose { get; set; } = 0;

        // =============================================
        // Deal Health & Scoring
        // =============================================
        [Range(0, 100)]
        public int DealScore { get; set; } = 50; // 0-100 health score
        
        [StringLength(20)]
        public string? DealHealth { get; set; } = "Healthy"; // At Risk, Healthy, Hot
        
        [StringLength(500)]
        public string? RiskFactors { get; set; } // JSON array of risk factors

        // =============================================
        // Next Steps & Actions
        // =============================================
        [StringLength(500)]
        public string? NextAction { get; set; }
        
        public DateTime? NextActionDate { get; set; }
        
        [StringLength(200)]
        public string? NextActionOwner { get; set; }

        // =============================================
        // Competitors
        // =============================================
        [StringLength(1000)]
        public string? Competitors { get; set; } // JSON array [{name, strength, weakness}]
        
        [StringLength(200)]
        public string? PrimaryCompetitor { get; set; }
        
        [StringLength(50)]
        public string? CompetitivePosition { get; set; } // Ahead, Behind, Even, Unknown

        // =============================================
        // Value & Forecasting
        // =============================================
        [Column(TypeName = "decimal(18,2)")]
        public decimal WeightedValue { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? RecurringValue { get; set; } // Monthly/Annual recurring revenue
        
        [StringLength(20)]
        public string? Currency { get; set; } = "USD";
        
        // Forecast category
        [StringLength(50)]
        public string? ForecastCategory { get; set; } // Pipeline, Best Case, Commit, Omitted

        // =============================================
        // Relationships
        // =============================================
        public int? ContactId { get; set; }
        public Contact? Contact { get; set; }
        
        public int? CompanyId { get; set; }
        public Company? Company { get; set; }
        
        [StringLength(200)]
        public string? Owner { get; set; } // Sales rep name
        
        public int? OwnerId { get; set; } // User ID when auth is implemented

        // =============================================
        // Source & Type
        // =============================================
        [StringLength(100)]
        public string? Source { get; set; } // Website, Referral, Cold Call, etc.
        
        [StringLength(100)]
        public string? Type { get; set; } // New Business, Upsell, Renewal, etc.

        // =============================================
        // Description & Notes
        // =============================================
        [StringLength(2000)]
        public string? Description { get; set; }
        
        [StringLength(1000)]
        public string? Tags { get; set; } // JSON array

        // =============================================
        // Timestamps
        // =============================================
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastModifiedAt { get; set; } = DateTime.UtcNow;

        // =============================================
        // Navigation Properties
        // =============================================
        public ICollection<StageHistory>? StageHistory { get; set; }
        public ICollection<OpportunityProduct>? Products { get; set; }

        [NotMapped]
        public IEnumerable<CustomFieldValue>? CustomValues { get; set; }
    }

    // =============================================
    // Opportunity Product/Line Item
    // =============================================
    public class OpportunityProduct
    {
        public int Id { get; set; }
        
        public int OpportunityId { get; set; }
        public Opportunity? Opportunity { get; set; }
        
        [Required]
        [StringLength(200)]
        public string ProductName { get; set; } = string.Empty;
        
        [StringLength(50)]
        public string? ProductCode { get; set; }
        
        public int Quantity { get; set; } = 1;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? Discount { get; set; } // Percentage or fixed amount
        
        [StringLength(20)]
        public string? DiscountType { get; set; } = "Percentage"; // Percentage or Fixed
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    // =============================================
    // Opportunity Stage Constants
    // =============================================
    public static class OpportunityStages
    {
        public const string Lead = "Lead";
        public const string Qualified = "Qualified";
        public const string Proposal = "Proposal";
        public const string Negotiation = "Negotiation";
        public const string ClosedWon = "Closed Won";
        public const string ClosedLost = "Closed Lost";

        public static readonly string[] All = { Lead, Qualified, Proposal, Negotiation, ClosedWon, ClosedLost };

        public static readonly Dictionary<string, int> DefaultProbabilities = new()
        {
            { Lead, 10 },
            { Qualified, 25 },
            { Proposal, 50 },
            { Negotiation, 75 },
            { ClosedWon, 100 },
            { ClosedLost, 0 }
        };

        public static readonly Dictionary<string, string> Colors = new()
        {
            { Lead, "#6366F1" },       // Indigo
            { Qualified, "#3B82F6" },   // Blue
            { Proposal, "#F59E0B" },    // Amber
            { Negotiation, "#8B5CF6" }, // Purple
            { ClosedWon, "#22C55E" },   // Green
            { ClosedLost, "#EF4444" }   // Red
        };
    }

    // =============================================
    // Predefined Options
    // =============================================
    public static class OpportunityOptions
    {
        public static readonly string[] WinReasons = 
        {
            "Price", "Features", "Relationship", "Brand Trust", "Speed", "Support", "Customization", "Integration", "Other"
        };

        public static readonly string[] LossReasons =
        {
            "Price Too High", "Lost to Competition", "No Budget", "Bad Timing", "No Decision",
            "Missing Features", "Poor Fit", "Champion Left", "Project Cancelled", "Other"
        };

        public static readonly string[] Sources =
        {
            "Website", "Referral", "Cold Call", "Trade Show", "Partner", "Social Media", 
            "Email Campaign", "Inbound", "Outbound", "Existing Customer", "Other"
        };

        public static readonly string[] Types =
        {
            "New Business", "Upsell", "Cross-sell", "Renewal", "Expansion", "Replacement"
        };

        public static readonly string[] ForecastCategories =
        {
            "Pipeline", "Best Case", "Commit", "Closed", "Omitted"
        };

        public static readonly string[] DealHealthOptions =
        {
            "Hot", "Healthy", "At Risk", "Stalled"
        };
    }
}
