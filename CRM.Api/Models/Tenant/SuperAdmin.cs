using System.ComponentModel.DataAnnotations;

namespace CRM.Api.Models.Tenant
{
    /// <summary>
    /// Super Admin - Platform administrators who can manage all tenants.
    /// These are YOUR employees who manage the SaaS platform.
    /// </summary>
    public class SuperAdmin
    {
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(200)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string FullName { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }
    }
}
