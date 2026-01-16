using System.ComponentModel.DataAnnotations;

namespace CRM.Api.Models.Auth
{
    /// <summary>
    /// Custom role defined by each tenant.
    /// Each tenant can create their own roles.
    /// </summary>
    public class Role
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        /// <summary>
        /// System roles (Admin, Manager, User) cannot be deleted
        /// </summary>
        public bool IsSystemRole { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    }
}
