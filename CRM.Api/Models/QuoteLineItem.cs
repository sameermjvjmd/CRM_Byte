using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CRM.Api.Models
{
    /// <summary>
    /// Individual line item in a quote
    /// </summary>
    public class QuoteLineItem
    {
        public int Id { get; set; }

        // Parent Quote
        public int QuoteId { get; set; }
        public Quote? Quote { get; set; }

        // Product Reference (optional - can be custom item)
        public int? ProductId { get; set; }
        public Product? Product { get; set; }

        // Item Details
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(50)]
        public string? SKU { get; set; }

        public string? Description { get; set; }

        // Quantity & Pricing
        [Column(TypeName = "decimal(18,4)")]
        public decimal Quantity { get; set; } = 1;

        [StringLength(20)]
        public string UnitOfMeasure { get; set; } = "Each";

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Cost { get; set; }

        // Discount
        [Column(TypeName = "decimal(5,2)")]
        public decimal DiscountPercent { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount { get; set; }

        // Tax
        public bool IsTaxable { get; set; } = true;

        [Column(TypeName = "decimal(5,2)")]
        public decimal TaxRate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount { get; set; }

        // Calculated totals
        [Column(TypeName = "decimal(18,2)")]
        public decimal LineTotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal LineTotalWithTax { get; set; }

        // Sort order
        public int SortOrder { get; set; }

        // Optional grouping
        [StringLength(100)]
        public string? GroupName { get; set; }

        // Notes
        public string? Notes { get; set; }

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastModifiedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Calculate line totals based on quantity, price, and discounts
        /// </summary>
        public void CalculateTotals()
        {
            var subtotal = Quantity * UnitPrice;
            
            // Apply discount
            if (DiscountPercent > 0)
            {
                DiscountAmount = subtotal * (DiscountPercent / 100);
            }
            subtotal -= DiscountAmount;
            
            LineTotal = subtotal;

            // Apply tax
            if (IsTaxable && TaxRate > 0)
            {
                TaxAmount = LineTotal * (TaxRate / 100);
            }
            else
            {
                TaxAmount = 0;
            }

            LineTotalWithTax = LineTotal + TaxAmount;
        }
    }

    /// <summary>
    /// Unit of Measure constants
    /// </summary>
    public static class UnitOfMeasure
    {
        public const string Each = "Each";
        public const string Hour = "Hour";
        public const string Day = "Day";
        public const string Week = "Week";
        public const string Month = "Month";
        public const string Year = "Year";
        public const string License = "License";
        public const string User = "User";
        public const string Unit = "Unit";
        public const string Box = "Box";
        public const string Case = "Case";

        public static readonly string[] All = { Each, Hour, Day, Week, Month, Year, License, User, Unit, Box, Case };
    }
}
