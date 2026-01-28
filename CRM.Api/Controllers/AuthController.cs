using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Services;
using CRM.Api.DTOs.Auth;
using CRM.Api.Models.Auth;
using CRM.Api.Data;
using CRM.Api.Services.Security;
using CRM.Api.Services.Email;
using System.Security.Claims;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(IAuthService authService, ApplicationDbContext context, IConfiguration configuration)
        {
            _authService = authService;
            _context = context;
            _configuration = configuration;
        }

        /// <summary>
        /// Login with email and password
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            var response = await _authService.LoginAsync(request);
            
            // If User has 2FA enabled, the service might return a special response or we handle it here
            // Note: The AuthService needs to support returning a "2FA Required" state. 
            // For now, we assume the AuthService handles the initial check and returns a partial success or specific status.
            
            if (!response.Success)
            {
                if (response.Message == "2FA Required") 
                {
                    // Return 200 OK but with 2FA flag so frontend knows to prompt
                    // In a real flow, we would return a temporary token here.
                    return Ok(response); 
                }
                return Unauthorized(response);
            }

            return Ok(response);
        }

        [HttpPost("2fa/setup")]
        [Authorize]
        public async Task<ActionResult<TwoFactorSetupResponse>> SetupTwoFactor([FromServices] ITwoFactorService tfaService)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? "user@example.com";
            var (secret, qrCodeUri) = tfaService.GenerateSetupInfo(userEmail);

            return Ok(new TwoFactorSetupResponse 
            { 
                Success = true, 
                Secret = secret, 
                QrCodeUri = qrCodeUri 
            });
        }

        [HttpPost("2fa/enable")]
        [Authorize]
        public async Task<IActionResult> EnableTwoFactor([FromBody] TwoFactorEnableRequest request, [FromServices] ITwoFactorService tfaService, [FromServices] ApplicationDbContext dbContext)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            // Validate code
            if (!tfaService.ValidateToken(request.Secret, request.Code))
            {
                return BadRequest(new { message = "Invalid verification code" });
            }

            // Save to DB
            var user = await dbContext.TenantUsers.FindAsync(userId);
            if (user != null)
            {
                user.TwoFactorEnabled = true;
                user.TwoFactorSecret = request.Secret;
                await dbContext.SaveChangesAsync();
                return Ok(new { message = "Two-factor authentication enabled successfully" });
            }

            return NotFound();
        }

        [HttpPost("2fa/validate")]
        public async Task<ActionResult<LoginResponse>> ValidateTwoFactor([FromBody] TwoFactorValidateRequest request, [FromServices] ITwoFactorService tfaService, [FromServices] ApplicationDbContext dbContext, [FromServices] IJwtService jwtService)
        {
            // Verify temp token (in real app, use a short-lived signed JWT for "partial auth")
            // For this quick impl, we might assume the client sends the user ID or email signed.
            // Simplified: Trusting the logic flow for prototype. In production, use a dedicated temp token.
            
            // Find user
            var user = await dbContext.TenantUsers.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !user.TwoFactorEnabled) return Unauthorized(new { message = "Invalid request" });

            if (!tfaService.ValidateToken(user.TwoFactorSecret!, request.Code))
            {
                return Unauthorized(new { message = "Invalid 2FA code" });
            }

            // Generate full token
            var roles = await _authService.GetUserRolesAsync(user.Id);
            var permissions = await _authService.GetUserPermissionsAsync(user.Id);

            var token = jwtService.GenerateAccessToken(user, roles, permissions);
            var refreshToken = jwtService.GenerateRefreshToken();
            
            // Save refresh token
            var refreshTokenDays = int.Parse(_configuration["JwtSettings:RefreshTokenExpirationDays"] ?? "7");
            var refreshTokenEntity = new RefreshToken
            {
                UserId = user.Id,
                Token = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(refreshTokenDays),
                CreatedAt = DateTime.UtcNow
            };
            dbContext.RefreshTokens.Add(refreshTokenEntity);
            
            await dbContext.SaveChangesAsync();

            return Ok(new LoginResponse 
            { 
                Success = true, 
                AccessToken = token, 
                RefreshToken = refreshToken,
                User = new UserInfo
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Roles = roles,
                    Permissions = permissions
                }
            });
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

            var user = await _context.TenantUsers.FindAsync(userId);
            if (user == null) return NotFound();

            var roles = await _authService.GetUserRolesAsync(userId);
            var permissions = await _authService.GetUserPermissionsAsync(userId);

            return Ok(new UserInfo
            {
                Id = userId,
                Email = user.Email,
                FullName = user.FullName,
                AvatarUrl = user.AvatarUrl,
                Roles = roles,
                Permissions = permissions,
                TwoFactorEnabled = user.TwoFactorEnabled
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
