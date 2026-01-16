using System.ComponentModel.DataAnnotations;

namespace CRM.Api.DTOs.Tenant
{
    /// <summary>
    /// Request for self-service tenant registration
    /// </summary>
    public class RegisterTenantRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 3)]
        [RegularExpression(@"^[a-zA-Z0-9_]+$", ErrorMessage = "Subdomain can only contain letters, numbers, and underscores")]
        public string Subdomain { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string CompanyName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string AdminEmail { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        public string AdminPassword { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string AdminName { get; set; } = string.Empty;

        public string? Plan { get; set; } = "Free";
    }

    /// <summary>
    /// Response after creating a tenant
    /// </summary>
    public class TenantResponse
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public int? TenantId { get; set; }
        public string? Subdomain { get; set; }
        public string? CompanyName { get; set; }
        public string? LoginUrl { get; set; }
    }

    /// <summary>
    /// Tenant details for listing/display
    /// </summary>
    public class TenantDto
    {
        public int Id { get; set; }
        public string Subdomain { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Plan { get; set; } = string.Empty;
        public int MaxUsers { get; set; }
        public string AdminEmail { get; set; } = string.Empty;
        public string? AdminName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? TrialEndsAt { get; set; }
        public DateTime? SubscriptionEndsAt { get; set; }
        public string? LogoUrl { get; set; }
        public string? PrimaryColor { get; set; }
    }

    /// <summary>
    /// Admin request to create a tenant
    /// </summary>
    public class CreateTenantAdminRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 3)]
        [RegularExpression(@"^[a-zA-Z0-9_]+$", ErrorMessage = "Subdomain can only contain letters, numbers, and underscores")]
        public string Subdomain { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string CompanyName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string AdminEmail { get; set; } = string.Empty;

        [StringLength(200)]
        public string? AdminName { get; set; }

        [StringLength(50)]
        public string Plan { get; set; } = "Free";

        public int? MaxUsers { get; set; }

        /// <summary>
        /// If true, skip trial and set status to Active
        /// </summary>
        public bool SkipTrial { get; set; } = false;
    }

    /// <summary>
    /// Request to update tenant
    /// </summary>
    public class UpdateTenantRequest
    {
        [StringLength(200)]
        public string? CompanyName { get; set; }

        [StringLength(50)]
        public string? Status { get; set; }

        [StringLength(50)]
        public string? Plan { get; set; }

        public int? MaxUsers { get; set; }

        [StringLength(500)]
        public string? LogoUrl { get; set; }

        [StringLength(7)]
        public string? PrimaryColor { get; set; }

        public DateTime? SubscriptionEndsAt { get; set; }
    }

    /// <summary>
    /// Check subdomain availability response
    /// </summary>
    public class SubdomainCheckResponse
    {
        public string Subdomain { get; set; } = string.Empty;
        public bool Available { get; set; }
        public string? Message { get; set; }
    }
}
