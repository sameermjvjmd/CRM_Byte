using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.DTOs.Auth;
using CRM.Api.Models.Auth;

namespace CRM.Api.Services
{
    public interface IAuthService
    {
        Task<LoginResponse> LoginAsync(LoginRequest request);
        Task<RegisterResponse> RegisterAsync(RegisterRequest request);
        Task<LoginResponse> RefreshTokenAsync(string refreshToken);
        Task<bool> RevokeTokenAsync(string refreshToken);
        Task<List<string>> GetUserRolesAsync(int userId);
        Task<List<string>> GetUserPermissionsAsync(int userId);
    }

    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IJwtService _jwtService;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IJwtService jwtService, IConfiguration configuration)
        {
            _context = context;
            _jwtService = jwtService;
            _configuration = configuration;
        }

        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            // Find user by email
            var user = await _context.TenantUsers
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r.RolePermissions)
                            .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

            if (user == null)
            {
                return new LoginResponse { Success = false, Message = "Invalid email or password" };
            }

            if (!user.IsActive)
            {
                return new LoginResponse { Success = false, Message = "Account is disabled. Contact your administrator." };
            }

            // Verify password
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return new LoginResponse { Success = false, Message = "Invalid email or password" };
            }

            // Get roles and permissions
            var roles = await GetUserRolesAsync(user.Id);
            var permissions = await GetUserPermissionsAsync(user.Id);

            // Generate tokens
            var accessToken = _jwtService.GenerateAccessToken(user, roles, permissions);
            var refreshToken = _jwtService.GenerateRefreshToken();

            // Get refresh token expiration from config
            var refreshTokenDays = int.Parse(_configuration["JwtSettings:RefreshTokenExpirationDays"] ?? "7");

            // Save refresh token
            var refreshTokenEntity = new RefreshToken
            {
                UserId = user.Id,
                Token = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(refreshTokenDays),
                CreatedAt = DateTime.UtcNow
            };
            _context.RefreshTokens.Add(refreshTokenEntity);

            // Update last login
            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return new LoginResponse
            {
                Success = true,
                Message = "Login successful",
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(int.Parse(_configuration["JwtSettings:AccessTokenExpirationMinutes"] ?? "60")),
                User = new UserInfo
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    AvatarUrl = user.AvatarUrl,
                    Roles = roles,
                    Permissions = permissions
                }
            };
        }

        public async Task<RegisterResponse> RegisterAsync(RegisterRequest request)
        {
            // Check if email already exists
            var existingUser = await _context.TenantUsers
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

            if (existingUser != null)
            {
                return new RegisterResponse { Success = false, Message = "Email is already registered" };
            }

            // Create new user
            var user = new TenantUser
            {
                Email = request.Email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FullName = request.FullName,
                FirstName = request.FirstName,
                LastName = request.LastName,
                JobTitle = request.JobTitle,
                Phone = request.Phone,
                IsActive = true,
                EmailVerified = false, // Email verification not implemented yet
                CreatedAt = DateTime.UtcNow
            };

            _context.TenantUsers.Add(user);
            await _context.SaveChangesAsync();

            // Assign default "User" role (ID = 3)
            var userRole = new UserRole
            {
                UserId = user.Id,
                RoleId = 3, // User role
                AssignedAt = DateTime.UtcNow
            };
            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();

            return new RegisterResponse
            {
                Success = true,
                Message = "Registration successful",
                UserId = user.Id
            };
        }

        public async Task<LoginResponse> RefreshTokenAsync(string refreshToken)
        {
            var storedToken = await _context.RefreshTokens
                .Include(rt => rt.User)
                    .ThenInclude(u => u.UserRoles)
                        .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

            if (storedToken == null)
            {
                return new LoginResponse { Success = false, Message = "Invalid refresh token" };
            }

            if (storedToken.IsExpired)
            {
                return new LoginResponse { Success = false, Message = "Refresh token has expired" };
            }

            if (storedToken.IsRevoked)
            {
                return new LoginResponse { Success = false, Message = "Refresh token has been revoked" };
            }

            var user = storedToken.User;
            if (!user.IsActive)
            {
                return new LoginResponse { Success = false, Message = "Account is disabled" };
            }

            // Revoke current refresh token
            storedToken.RevokedAt = DateTime.UtcNow;

            // Generate new tokens
            var roles = await GetUserRolesAsync(user.Id);
            var permissions = await GetUserPermissionsAsync(user.Id);
            var newAccessToken = _jwtService.GenerateAccessToken(user, roles, permissions);
            var newRefreshToken = _jwtService.GenerateRefreshToken();

            // Save new refresh token
            var refreshTokenDays = int.Parse(_configuration["JwtSettings:RefreshTokenExpirationDays"] ?? "7");
            var newRefreshTokenEntity = new RefreshToken
            {
                UserId = user.Id,
                Token = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(refreshTokenDays),
                CreatedAt = DateTime.UtcNow,
                ReplacedByToken = storedToken.Token
            };
            _context.RefreshTokens.Add(newRefreshTokenEntity);

            await _context.SaveChangesAsync();

            return new LoginResponse
            {
                Success = true,
                Message = "Token refreshed",
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(int.Parse(_configuration["JwtSettings:AccessTokenExpirationMinutes"] ?? "60")),
                User = new UserInfo
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    AvatarUrl = user.AvatarUrl,
                    Roles = roles,
                    Permissions = permissions
                }
            };
        }

        public async Task<bool> RevokeTokenAsync(string refreshToken)
        {
            var storedToken = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

            if (storedToken == null || storedToken.IsRevoked)
            {
                return false;
            }

            storedToken.RevokedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<string>> GetUserRolesAsync(int userId)
        {
            return await _context.UserRoles
                .Where(ur => ur.UserId == userId)
                .Include(ur => ur.Role)
                .Select(ur => ur.Role.Name)
                .ToListAsync();
        }

        public async Task<List<string>> GetUserPermissionsAsync(int userId)
        {
            return await _context.UserRoles
                .Where(ur => ur.UserId == userId)
                .Include(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
                .SelectMany(ur => ur.Role.RolePermissions.Select(rp => rp.Permission.Code))
                .Distinct()
                .ToListAsync();
        }
    }
}
