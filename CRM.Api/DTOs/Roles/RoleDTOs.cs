using System.ComponentModel.DataAnnotations;

namespace CRM.Api.DTOs.Roles
{
    /// <summary>
    /// Role details with permissions
    /// </summary>
    public class RoleDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsSystemRole { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<PermissionDto> Permissions { get; set; } = new();
        public int UserCount { get; set; }
    }

    /// <summary>
    /// Permission details
    /// </summary>
    public class PermissionDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    /// <summary>
    /// Permissions grouped by category for UI display
    /// </summary>
    public class PermissionCategoryDto
    {
        public string Category { get; set; } = string.Empty;
        public List<PermissionDto> Permissions { get; set; } = new();
    }

    /// <summary>
    /// Request to create a new role
    /// </summary>
    public class CreateRoleRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        /// <summary>
        /// List of permission IDs to assign to this role
        /// </summary>
        public List<int> PermissionIds { get; set; } = new();
    }

    /// <summary>
    /// Request to update a role
    /// </summary>
    public class UpdateRoleRequest
    {
        [StringLength(100, MinimumLength = 2)]
        public string? Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }
    }

    /// <summary>
    /// Request to update role permissions
    /// </summary>
    public class UpdateRolePermissionsRequest
    {
        /// <summary>
        /// Complete list of permission IDs - replaces existing permissions
        /// </summary>
        [Required]
        public List<int> PermissionIds { get; set; } = new();
    }

    /// <summary>
    /// Simple list item for dropdowns
    /// </summary>
    public class RoleListItem
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsSystemRole { get; set; }
    }
}
