using System.ComponentModel.DataAnnotations;

namespace CRM.Api.DTOs.Users
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? JobTitle { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public string Role { get; set; } = string.Empty;
        public int RoleId { get; set; }
    }

    public class CreateUserRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string FullName { get; set; } = string.Empty;

        public string? JobTitle { get; set; }

        [Required]
        public int RoleId { get; set; }
    }

    public class UpdateUserRequest
    {
        [Required]
        public string FullName { get; set; } = string.Empty;

        public string? JobTitle { get; set; }

        [Required]
        public int RoleId { get; set; }
        
        public string? Password { get; set; }
    }
}
