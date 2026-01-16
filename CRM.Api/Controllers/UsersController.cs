using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using CRM.Api.Data;
using CRM.Api.Models.Auth;
using CRM.Api.DTOs.Users;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var users = await _context.TenantUsers
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    FullName = u.FullName,
                    JobTitle = u.JobTitle,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt,
                    LastLoginAt = u.LastLoginAt,
                    Role = u.UserRoles.FirstOrDefault() != null ? u.UserRoles.First().Role.Name : "None",
                    RoleId = u.UserRoles.FirstOrDefault() != null ? u.UserRoles.First().RoleId : 0
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            var user = await _context.TenantUsers
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                JobTitle = user.JobTitle,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                Role = user.UserRoles.FirstOrDefault()?.Role.Name ?? "None",
                RoleId = user.UserRoles.FirstOrDefault()?.RoleId ?? 0
            });
        }

        // POST: api/users
        [HttpPost]
        [Authorize(Policy = "admin.users")]
        public async Task<ActionResult<UserDto>> CreateUser(CreateUserRequest request)
        {
            // Check if email exists
            if (await _context.TenantUsers.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower()))
            {
                return BadRequest(new { message = "Email already registered" });
            }

            // Verify Role Exists
            var role = await _context.Roles.FindAsync(request.RoleId);
            if (role == null)
            {
                return BadRequest(new { message = "Invalid Role ID" });
            }

            var user = new TenantUser
            {
                Email = request.Email,
                FullName = request.FullName,
                JobTitle = request.JobTitle,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.TenantUsers.Add(user);
            await _context.SaveChangesAsync();

            // Assign Role
            _context.UserRoles.Add(new UserRole
            {
                UserId = user.Id,
                RoleId = request.RoleId,
                AssignedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            // Return DTO
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                JobTitle = user.JobTitle,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                Role = role.Name,
                RoleId = role.Id
            });
        }

        // PUT: api/users/5
        [HttpPut("{id}")]
        [Authorize(Policy = "admin.users")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserRequest request)
        {
            var user = await _context.TenantUsers
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound();
            }

            // Update allowed fields
            user.FullName = request.FullName;
            user.JobTitle = request.JobTitle;

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            }

            // Update Role if changed
            var currentRole = user.UserRoles.FirstOrDefault();
            if (currentRole == null || currentRole.RoleId != request.RoleId)
            {
                // Verify new role exists first
                if (!await _context.Roles.AnyAsync(r => r.Id == request.RoleId))
                {
                    return BadRequest(new { message = "Invalid Role ID" });
                }

                // Remove existing roles (assuming 1 role per user for now)
                _context.UserRoles.RemoveRange(user.UserRoles);
                
                // Add new role
                _context.UserRoles.Add(new UserRole
                {
                    UserId = user.Id,
                    RoleId = request.RoleId,
                    AssignedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "User updated successfully" });
        }

        // PATCH: api/users/5/status
        [HttpPatch("{id}/status")]
        [Authorize(Policy = "admin.users")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var user = await _context.TenantUsers.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Prevent deactivating own account
            // In a real app, check CurrentUserId vs id. 
            // For now we allow it but frontend should block it.

            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"User {(user.IsActive ? "activated" : "deactivated")}" });
        }

        // DELETE: api/users/5
        [HttpDelete("{id}")]
        [Authorize(Policy = "admin.users")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.TenantUsers.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.TenantUsers.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
