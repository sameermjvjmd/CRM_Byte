using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CRM.Api.Models
{
    /// <summary>
    /// Quote/Proposal entity for sales
    /// </summary>
    public class Quote
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Subject { get; set; } = string.Empty;

        [StringLength(50)]
        public string QuoteNumber { get; set; } = string.Empty;

        // Status: Draft, Sent, Viewed, Accepted, Declined, Expired
        [StringLength(20)]
        public string Status { get; set; } = "Draft";

        // Associations
        public int? ContactId { get; set; }
        public Contact? Contact { get; set; }

        public int? CompanyId { get; set; }
        public Company? Company { get; set; }

        public int? OpportunityId { get; set; }
        public Opportunity? Opportunity { get; set; }

        // Dates
        public DateTime QuoteDate { get; set; } = DateTime.UtcNow;
        public DateTime? ExpirationDate { get; set; }
        public DateTime? SentDate { get; set; }
        public DateTime? ViewedDate { get; set; }
        public DateTime? AcceptedDate { get; set; }
        public DateTime? DeclinedDate { get; set; }

        // Pricing
        [Column(TypeName = "decimal(18,2)")]
        public decimal Subtotal { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal DiscountPercent { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ShippingAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }

        [StringLength(3)]
        public string Currency { get; set; } = "USD";

        // Terms
        [StringLength(50)]
        public string PaymentTerms { get; set; } = "Net 30";

        public string? TermsAndConditions { get; set; }

        public string? Notes { get; set; }

        // Recipient Info (can be different from contact)
        [StringLength(200)]
        public string? RecipientName { get; set; }

        [StringLength(255)]
        public string? RecipientEmail { get; set; }

        [StringLength(500)]
        public string? RecipientAddress { get; set; }

        // Tracking
        public int ViewCount { get; set; }
        public string? AcceptedByName { get; set; }
        public string? AcceptedByEmail { get; set; }
        public string? DeclineReason { get; set; }

        // Versioning
        public int Version { get; set; } = 1;
        public int? ParentQuoteId { get; set; }

        // Owner
        public int? OwnerId { get; set; }

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastModifiedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ICollection<QuoteLineItem> LineItems { get; set; } = new List<QuoteLineItem>();
    }

    /// <summary>
    /// Quote status constants
    /// </summary>
    public static class QuoteStatus
    {
        public const string Draft = "Draft";
        public const string Sent = "Sent";
        public const string Viewed = "Viewed";
        public const string Accepted = "Accepted";
        public const string Declined = "Declined";
        public const string Expired = "Expired";

        public static readonly string[] All = { Draft, Sent, Viewed, Accepted, Declined, Expired };
    }

    /// <summary>
    /// Payment terms constants
    /// </summary>
    public static class PaymentTerms
    {
        public const string DueOnReceipt = "Due on Receipt";
        public const string Net15 = "Net 15";
        public const string Net30 = "Net 30";
        public const string Net45 = "Net 45";
        public const string Net60 = "Net 60";

        public static readonly string[] All = { DueOnReceipt, Net15, Net30, Net45, Net60 };
    }
}
