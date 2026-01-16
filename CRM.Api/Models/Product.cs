using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CRM.Api.Models
{
    /// <summary>
    /// Product Catalog entity for Quotes and Opportunity Line Items
    /// </summary>
    public class Product
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(50)]
        public string? SKU { get; set; }

        [StringLength(100)]
        public string? Category { get; set; }

        [StringLength(2000)]
        public string? Description { get; set; }

        // =============================================
        // Pricing
        // =============================================
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Cost { get; set; } // For margin calculations

        [StringLength(10)]
        public string Currency { get; set; } = "USD";

        // =============================================
        // Tax & Billing
        // =============================================
        public bool IsTaxable { get; set; } = true;

        [Column(TypeName = "decimal(5,2)")]
        public decimal? TaxRate { get; set; } // e.g., 18.00 for 18%

        [StringLength(50)]
        public string? BillingFrequency { get; set; } // One-time, Monthly, Annual

        // =============================================
        // Inventory & Status
        // =============================================
        public bool IsActive { get; set; } = true;

        public int? StockQuantity { get; set; }

        public bool TrackInventory { get; set; } = false;

        // =============================================
        // Additional Info
        // =============================================
        [StringLength(500)]
        public string? ImageUrl { get; set; }

        [StringLength(500)]
        public string? ExternalId { get; set; } // For integration with external systems

        [StringLength(1000)]
        public string? Tags { get; set; } // JSON array

        // =============================================
        // Timestamps
        // =============================================
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastModifiedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Predefined product categories
    /// </summary>
    public static class ProductCategories
    {
        public const string Software = "Software";
        public const string Hardware = "Hardware";
        public const string Service = "Service";
        public const string Subscription = "Subscription";
        public const string License = "License";
        public const string Support = "Support";
        public const string Training = "Training";
        public const string Consulting = "Consulting";

        public static readonly string[] All = 
        { 
            Software, Hardware, Service, Subscription, License, Support, Training, Consulting 
        };
    }

    /// <summary>
    /// Billing frequency options
    /// </summary>
    public static class BillingFrequencies
    {
        public const string OneTime = "One-time";
        public const string Monthly = "Monthly";
        public const string Quarterly = "Quarterly";
        public const string Annual = "Annual";

        public static readonly string[] All = { OneTime, Monthly, Quarterly, Annual };
    }
}
