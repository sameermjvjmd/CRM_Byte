using System.ComponentModel.DataAnnotations;

namespace CRM.Api.Models.Auth
{
    /// <summary>
    /// Feature-based permission.
    /// These are seeded and the same across all tenants.
    /// </summary>
    public class Permission
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Code { get; set; } = string.Empty; // e.g., "contacts.view"

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty; // e.g., "View Contacts"

        [Required]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty; // e.g., "Contacts"

        [StringLength(500)]
        public string? Description { get; set; }

        // Navigation
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }
}
