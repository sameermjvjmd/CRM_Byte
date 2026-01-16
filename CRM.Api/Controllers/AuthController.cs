using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Services;
using CRM.Api.DTOs.Auth;
using CRM.Api.Data;
using System.Security.Claims;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ApplicationDbContext _context;

        public AuthController(IAuthService authService, ApplicationDbContext context)
        {
            _authService = authService;
            _context = context;
        }

        /// <summary>
        /// Login with email and password
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            var response = await _authService.LoginAsync(request);
            
            if (!response.Success)
            {
                return Unauthorized(response);
            }

            return Ok(response);
        }

        /// <summary>
        /// Register a new user account
        /// </summary>
        [HttpPost("register")]
        public async Task<ActionResult<RegisterResponse>> Register([FromBody] RegisterRequest request)
        {
            var response = await _authService.RegisterAsync(request);

            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        /// <summary>
        /// Refresh access token using refresh token
        /// </summary>
        [HttpPost("refresh")]
        public async Task<ActionResult<LoginResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            var response = await _authService.RefreshTokenAsync(request.RefreshToken);

            if (!response.Success)
            {
                return Unauthorized(response);
            }

            return Ok(response);
        }

        /// <summary>
        /// Logout and revoke refresh token
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest request)
        {
            var revoked = await _authService.RevokeTokenAsync(request.RefreshToken);
            
            if (!revoked)
            {
                return BadRequest(new { message = "Invalid token" });
            }

            return Ok(new { message = "Logged out successfully" });
        }

        /// <summary>
        /// Get current user info
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserInfo>> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst("userId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            var roles = await _authService.GetUserRolesAsync(userId);
            var permissions = await _authService.GetUserPermissionsAsync(userId);

            return Ok(new UserInfo
            {
                Id = userId,
                Email = User.FindFirst(ClaimTypes.Email)?.Value ?? "",
                FullName = User.FindFirst(ClaimTypes.Name)?.Value ?? "",
                Roles = roles,
                Permissions = permissions
            });
        }

        /// <summary>
        /// Check if a specific permission is granted
        /// </summary>
        [HttpGet("check-permission/{permission}")]
        [Authorize]
        public IActionResult CheckPermission(string permission)
        {
            var hasPermission = User.Claims
                .Any(c => c.Type == "permission" && c.Value == permission);

            return Ok(new { permission, hasAccess = hasPermission });
        }

        /// <summary>
        /// Validate current token
        /// </summary>
        [HttpGet("validate")]
        [Authorize]
        public IActionResult ValidateToken()
        {
            return Ok(new { valid = true, message = "Token is valid" });
        }

        /// <summary>
        /// Reset admin password (Development only - remove in production)
        /// </summary>
        [HttpPost("reset-admin-password")]
        public async Task<IActionResult> ResetAdminPassword([FromBody] ResetAdminRequest request)
        {
            var user = await _context.TenantUsers.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
            
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Password reset successfully for {request.Email}" });
        }
    }

    /// <summary>
    /// Request model for resetting admin password
    /// </summary>
    public class ResetAdminRequest
    {
        public string Email { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
