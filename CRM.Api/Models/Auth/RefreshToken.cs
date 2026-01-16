using System.ComponentModel.DataAnnotations;

namespace CRM.Api.Models.Auth
{
    /// <summary>
    /// Refresh token for JWT authentication.
    /// Allows users to get new access tokens without re-logging in.
    /// </summary>
    public class RefreshToken
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public TenantUser User { get; set; } = null!;

        [Required]
        [StringLength(200)]
        public string Token { get; set; } = string.Empty;

        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [StringLength(50)]
        public string? CreatedByIp { get; set; }

        public DateTime? RevokedAt { get; set; }

        [StringLength(50)]
        public string? RevokedByIp { get; set; }

        [StringLength(200)]
        public string? ReplacedByToken { get; set; }

        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
        public bool IsRevoked => RevokedAt != null;
        public bool IsActive => !IsRevoked && !IsExpired;
    }
}
