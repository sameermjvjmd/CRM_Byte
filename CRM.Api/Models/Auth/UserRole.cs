namespace CRM.Api.Models.Auth
{
    /// <summary>
    /// Many-to-many relationship between User and Role.
    /// </summary>
    public class UserRole
    {
        public int UserId { get; set; }
        public TenantUser User { get; set; } = null!;

        public int RoleId { get; set; }
        public Role Role { get; set; } = null!;

        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    }
}
