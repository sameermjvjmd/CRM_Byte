using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CRM.Api.Models
{
    public class Company
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        // =============================================
        // Company Hierarchy (Parent/Subsidiary)
        // =============================================
        public int? ParentCompanyId { get; set; }
        public Company? ParentCompany { get; set; }
        public ICollection<Company> Subsidiaries { get; set; } = new List<Company>();

        // =============================================
        // Industry Classification
        // =============================================
        public string? Industry { get; set; }
        
        [StringLength(10)]
        public string? SICCode { get; set; } // Standard Industrial Classification
        
        [StringLength(10)]
        public string? NAICSCode { get; set; } // North American Industry Classification System

        // =============================================
        // Business Metrics
        // =============================================
        [Column(TypeName = "decimal(18,2)")]
        public decimal? AnnualRevenue { get; set; }
        
        public int? EmployeeCount { get; set; }
        
        public string? FiscalYearEnd { get; set; } // e.g., "December", "March"

        // =============================================
        // Contact Information
        // =============================================
        public string? Website { get; set; }
        
        [Phone]
        [StringLength(20)]
        public string? Phone { get; set; }
        
        [Phone]
        [StringLength(20)]
        public string? Fax { get; set; }
        
        [EmailAddress]
        [StringLength(255)]
        public string? Email { get; set; }

        // =============================================
        // Primary Address
        // =============================================
        [StringLength(200)]
        public string? Address { get; set; }
        
        [StringLength(200)]
        public string? Address2 { get; set; }
        
        [StringLength(100)]
        public string? City { get; set; }
        
        [StringLength(100)]
        public string? State { get; set; }
        
        [StringLength(20)]
        public string? ZipCode { get; set; }
        
        [StringLength(100)]
        public string? Country { get; set; }

        // =============================================
        // Financial & Stock Info
        // =============================================
        [StringLength(10)]
        public string? TickerSymbol { get; set; }
        
        public string? StockExchange { get; set; } // NYSE, NASDAQ, etc.

        // =============================================
        // Company Details
        // =============================================
        public string? Description { get; set; }
        
        [StringLength(500)]
        public string? LogoUrl { get; set; }
        
        public string? CompanyType { get; set; } // Corporation, LLC, Partnership, etc.
        
        public int? YearFounded { get; set; }

        // =============================================
        // Timestamps
        // =============================================
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastModifiedAt { get; set; } = DateTime.UtcNow;

        // =============================================
        // Relationships
        // =============================================
        
        // One Company has many Contacts
        public ICollection<Contact> Contacts { get; set; } = new List<Contact>();
        
        // One Company has many Opportunities
        public ICollection<Opportunity> Opportunities { get; set; } = new List<Opportunity>();

        // =============================================
        // Helper Properties
        // =============================================
        
        [NotMapped]
        public string FormattedAddress => string.Join(", ", new[] { Address, City, State, ZipCode, Country }
            .Where(s => !string.IsNullOrWhiteSpace(s)));
        
        [NotMapped]
        public string FormattedRevenue => AnnualRevenue.HasValue 
            ? $"${AnnualRevenue.Value:N0}" 
            : "Not specified";
        
        [NotMapped]
        public int ContactCount => Contacts?.Count ?? 0;
        
        [NotMapped]
        public int OpportunityCount => Opportunities?.Count ?? 0;
    }
}
