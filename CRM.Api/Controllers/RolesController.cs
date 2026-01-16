using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.DTOs.Roles;
using CRM.Api.Models.Auth;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RolesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<RolesController> _logger;

        public RolesController(ApplicationDbContext context, ILogger<RolesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get all roles with their permissions
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<RoleDto>>> GetRoles()
        {
            var roles = await _context.Roles
                .Include(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                .Include(r => r.UserRoles)
                .OrderBy(r => r.IsSystemRole ? 0 : 1)
                .ThenBy(r => r.Name)
                .Select(r => new RoleDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    IsSystemRole = r.IsSystemRole,
                    CreatedAt = r.CreatedAt,
                    UserCount = r.UserRoles.Count,
                    Permissions = r.RolePermissions.Select(rp => new PermissionDto
                    {
                        Id = rp.Permission.Id,
                        Code = rp.Permission.Code,
                        Name = rp.Permission.Name,
                        Category = rp.Permission.Category
                    }).ToList()
                })
                .ToListAsync();

            return Ok(roles);
        }

        /// <summary>
        /// Get role by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<RoleDto>> GetRole(int id)
        {
            var role = await _context.Roles
                .Include(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                .Include(r => r.UserRoles)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (role == null)
            {
                return NotFound(new { message = "Role not found" });
            }

            return Ok(new RoleDto
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                IsSystemRole = role.IsSystemRole,
                CreatedAt = role.CreatedAt,
                UserCount = role.UserRoles.Count,
                Permissions = role.RolePermissions.Select(rp => new PermissionDto
                {
                    Id = rp.Permission.Id,
                    Code = rp.Permission.Code,
                    Name = rp.Permission.Name,
                    Category = rp.Permission.Category
                }).ToList()
            });
        }

        /// <summary>
        /// Get simple role list for dropdowns
        /// </summary>
        [HttpGet("list")]
        public async Task<ActionResult<List<RoleListItem>>> GetRoleList()
        {
            var roles = await _context.Roles
                .OrderBy(r => r.IsSystemRole ? 0 : 1)
                .ThenBy(r => r.Name)
                .Select(r => new RoleListItem
                {
                    Id = r.Id,
                    Name = r.Name,
                    IsSystemRole = r.IsSystemRole
                })
                .ToListAsync();

            return Ok(roles);
        }

        /// <summary>
        /// Create a new custom role
        /// </summary>
        [HttpPost]
        [Authorize(Policy = "admin.roles")]
        public async Task<ActionResult<RoleDto>> CreateRole([FromBody] CreateRoleRequest request)
        {
            // Check if role name exists
            var exists = await _context.Roles.AnyAsync(r => r.Name.ToLower() == request.Name.ToLower());
            if (exists)
            {
                return BadRequest(new { message = $"Role '{request.Name}' already exists" });
            }

            var role = new Role
            {
                Name = request.Name,
                Description = request.Description,
                IsSystemRole = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            // Add permissions if provided
            if (request.PermissionIds.Any())
            {
                var permissions = await _context.Permissions
                    .Where(p => request.PermissionIds.Contains(p.Id))
                    .ToListAsync();

                foreach (var permission in permissions)
                {
                    _context.RolePermissions.Add(new RolePermission
                    {
                        RoleId = role.Id,
                        PermissionId = permission.Id
                    });
                }
                await _context.SaveChangesAsync();
            }

            _logger.LogInformation("Role created: {RoleName}", role.Name);

            return CreatedAtAction(nameof(GetRole), new { id = role.Id }, new RoleDto
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                IsSystemRole = role.IsSystemRole,
                CreatedAt = role.CreatedAt,
                Permissions = new List<PermissionDto>()
            });
        }

        /// <summary>
        /// Update role details
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Policy = "admin.roles")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleRequest request)
        {
            var role = await _context.Roles.FindAsync(id);

            if (role == null)
            {
                return NotFound(new { message = "Role not found" });
            }

            if (role.IsSystemRole)
            {
                return BadRequest(new { message = "System roles cannot be modified" });
            }

            if (!string.IsNullOrEmpty(request.Name) && request.Name != role.Name)
            {
                // Check if new name exists
                var exists = await _context.Roles.AnyAsync(r => r.Name.ToLower() == request.Name.ToLower() && r.Id != id);
                if (exists)
                {
                    return BadRequest(new { message = $"Role '{request.Name}' already exists" });
                }
                role.Name = request.Name;
            }

            if (request.Description != null)
            {
                role.Description = request.Description;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Role updated: {RoleId} - {RoleName}", id, role.Name);

            return Ok(new { message = "Role updated successfully" });
        }

        /// <summary>
        /// Update role permissions
        /// </summary>
        [HttpPut("{id}/permissions")]
        [Authorize(Policy = "admin.roles")]
        public async Task<IActionResult> UpdateRolePermissions(int id, [FromBody] UpdateRolePermissionsRequest request)
        {
            var role = await _context.Roles
                .Include(r => r.RolePermissions)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (role == null)
            {
                return NotFound(new { message = "Role not found" });
            }

            // Remove existing permissions
            _context.RolePermissions.RemoveRange(role.RolePermissions);

            // Add new permissions
            foreach (var permissionId in request.PermissionIds.Distinct())
            {
                var permissionExists = await _context.Permissions.AnyAsync(p => p.Id == permissionId);
                if (permissionExists)
                {
                    _context.RolePermissions.Add(new RolePermission
                    {
                        RoleId = role.Id,
                        PermissionId = permissionId
                    });
                }
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Role permissions updated: {RoleId} - {RoleName} ({PermissionCount} permissions)", 
                id, role.Name, request.PermissionIds.Count);

            return Ok(new { message = "Permissions updated successfully" });
        }

        /// <summary>
        /// Delete a custom role
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Policy = "admin.roles")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            var role = await _context.Roles
                .Include(r => r.UserRoles)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (role == null)
            {
                return NotFound(new { message = "Role not found" });
            }

            if (role.IsSystemRole)
            {
                return BadRequest(new { message = "System roles cannot be deleted" });
            }

            if (role.UserRoles.Any())
            {
                return BadRequest(new { message = $"Cannot delete role. {role.UserRoles.Count} user(s) have this role assigned." });
            }

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Role deleted: {RoleId} - {RoleName}", id, role.Name);

            return Ok(new { message = "Role deleted successfully" });
        }

        /// <summary>
        /// Get all available permissions
        /// </summary>
        [HttpGet("permissions")]
        public async Task<ActionResult<List<PermissionDto>>> GetPermissions()
        {
            var permissions = await _context.Permissions
                .OrderBy(p => p.Category)
                .ThenBy(p => p.Name)
                .Select(p => new PermissionDto
                {
                    Id = p.Id,
                    Code = p.Code,
                    Name = p.Name,
                    Category = p.Category,
                    Description = p.Description
                })
                .ToListAsync();

            return Ok(permissions);
        }

        /// <summary>
        /// Get permissions grouped by category
        /// </summary>
        [HttpGet("permissions/grouped")]
        public async Task<ActionResult<List<PermissionCategoryDto>>> GetPermissionsGrouped()
        {
            var permissions = await _context.Permissions
                .OrderBy(p => p.Category)
                .ThenBy(p => p.Name)
                .ToListAsync();

            var grouped = permissions
                .GroupBy(p => p.Category)
                .Select(g => new PermissionCategoryDto
                {
                    Category = g.Key,
                    Permissions = g.Select(p => new PermissionDto
                    {
                        Id = p.Id,
                        Code = p.Code,
                        Name = p.Name,
                        Category = p.Category,
                        Description = p.Description
                    }).ToList()
                })
                .ToList();

            return Ok(grouped);
        }
    }
}
