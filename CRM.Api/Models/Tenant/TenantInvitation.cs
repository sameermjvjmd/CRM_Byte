using System.ComponentModel.DataAnnotations;

namespace CRM.Api.Models.Tenant
{
    /// <summary>
    /// Invitation for a user to join a tenant, or for self-service signup.
    /// </summary>
    public class TenantInvitation
    {
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(200)]
        public string Email { get; set; } = string.Empty;

        public int? TenantId { get; set; }
        public TenantInfo? Tenant { get; set; }

        [Required]
        [StringLength(200)]
        public string Token { get; set; } = string.Empty;

        [StringLength(50)]
        public string InvitationType { get; set; } = "User"; // User, Admin, NewTenant

        public DateTime ExpiresAt { get; set; }
        public bool Used { get; set; } = false;
        public DateTime? UsedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
