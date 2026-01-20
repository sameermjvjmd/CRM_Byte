using System.ComponentModel.DataAnnotations;

namespace CRM.Api.Models
{
    public class QuoteTemplate
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = "Default Template";

        // Branding
        [StringLength(200)]
        public string CompanyName { get; set; } = "Your Company Name";

        [StringLength(500)]
        public string CompanyAddress { get; set; } = "123 Business Street\nCity, State 12345";

        public string? CompanyLogoUrl { get; set; }

        // Colors
        [StringLength(20)]
        public string PrimaryColor { get; set; } = "#4f46e5"; // Indigo-600

        [StringLength(20)]
        public string SecondaryColor { get; set; } = "#64748b"; // Slate-500

        public string? TextColor { get; set; } = "#0f172a"; // Slate-900

        // Layout / Visibility Options
        public bool ShowSku { get; set; } = true;
        public bool ShowQuantity { get; set; } = true;
        public bool ShowDiscountColumn { get; set; } = true;
        public bool ShowTaxSummary { get; set; } = true;
        public bool ShowShipping { get; set; } = true;
        public bool ShowNotes { get; set; } = true;
        
        // Content
        public string? DefaultTerms { get; set; }
        public string? DefaultFooter { get; set; } = "Thank you for your business!";
        
        public bool IsDefault { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
