namespace CRM.Api.Models.Auth
{
    /// <summary>
    /// Many-to-many relationship between Role and Permission.
    /// </summary>
    public class RolePermission
    {
        public int RoleId { get; set; }
        public Role Role { get; set; } = null!;

        public int PermissionId { get; set; }
        public Permission Permission { get; set; } = null!;
    }
}
