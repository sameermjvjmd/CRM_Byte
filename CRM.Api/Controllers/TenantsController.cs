using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Services;
using CRM.Api.DTOs.Tenant;
using CRM.Api.Models.Auth;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TenantsController : ControllerBase
    {
        private readonly MasterDbContext _masterContext;
        private readonly ITenantService _tenantService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<TenantsController> _logger;

        public TenantsController(
            MasterDbContext masterContext, 
            ITenantService tenantService,
            IConfiguration configuration,
            ILogger<TenantsController> logger)
        {
            _masterContext = masterContext;
            _tenantService = tenantService;
            _configuration = configuration;
            _logger = logger;
        }

        /// <summary>
        /// Check if a subdomain is available
        /// </summary>
        [HttpGet("check-subdomain/{subdomain}")]
        public async Task<ActionResult<SubdomainCheckResponse>> CheckSubdomain(string subdomain)
        {
            // Validate subdomain format
            if (string.IsNullOrWhiteSpace(subdomain) || subdomain.Length < 3)
            {
                return Ok(new SubdomainCheckResponse 
                { 
                    Subdomain = subdomain, 
                    Available = false, 
                    Message = "Subdomain must be at least 3 characters" 
                });
            }

            // Check reserved subdomains
            var reserved = new[] { "www", "api", "app", "admin", "localhost", "mail", "ftp", "demo", "test" };
            if (reserved.Contains(subdomain.ToLower()))
            {
                return Ok(new SubdomainCheckResponse 
                { 
                    Subdomain = subdomain, 
                    Available = false, 
                    Message = "This subdomain is reserved" 
                });
            }

            var exists = await _tenantService.SubdomainExistsAsync(subdomain);
            
            return Ok(new SubdomainCheckResponse
            {
                Subdomain = subdomain,
                Available = !exists,
                Message = exists ? "Subdomain is already taken" : "Subdomain is available"
            });
        }

        /// <summary>
        /// Self-service tenant registration (public endpoint)
        /// </summary>
        [HttpPost("register")]
        public async Task<ActionResult<TenantResponse>> Register([FromBody] RegisterTenantRequest request)
        {
            try
            {
                // Check if self-registration is allowed
                var allowSelfReg = bool.Parse(_configuration["TenantSettings:AllowSelfRegistration"] ?? "true");
                if (!allowSelfReg)
                {
                    return BadRequest(new TenantResponse 
                    { 
                        Success = false, 
                        Message = "Self-registration is disabled. Please contact sales." 
                    });
                }

                // Check subdomain availability
                if (await _tenantService.SubdomainExistsAsync(request.Subdomain))
                {
                    return BadRequest(new TenantResponse 
                    { 
                        Success = false, 
                        Message = $"Subdomain '{request.Subdomain}' is already taken" 
                    });
                }

                // Create the tenant
                var tenant = await _tenantService.CreateTenantAsync(new CreateTenantRequest
                {
                    Subdomain = request.Subdomain.ToLower(),
                    CompanyName = request.CompanyName,
                    AdminEmail = request.AdminEmail,
                    AdminName = request.AdminName,
                    Plan = request.Plan ?? "Free"
                });

                // Create admin user in the new tenant's database
                await CreateTenantAdminUserAsync(tenant.ConnectionString!, request.AdminEmail, request.AdminPassword, request.AdminName);

                _logger.LogInformation("New tenant registered: {Subdomain} - {Company}", tenant.Subdomain, tenant.CompanyName);

                return Ok(new TenantResponse
                {
                    Success = true,
                    Message = "Organization created successfully!",
                    TenantId = tenant.Id,
                    Subdomain = tenant.Subdomain,
                    CompanyName = tenant.CompanyName,
                    LoginUrl = $"https://{tenant.Subdomain}.nexuscrm.com/login"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to register tenant: {Subdomain}", request.Subdomain);
                return StatusCode(500, new TenantResponse 
                { 
                    Success = false, 
                    Message = $"Failed: {ex.Message} {(ex.InnerException != null ? "Inner: " + ex.InnerException.Message : "")}" 
                });
            }
        }

        /// <summary>
        /// List all tenants (super admin only)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<ActionResult<List<TenantDto>>> GetAllTenants()
        {
            var tenants = await _masterContext.Tenants
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new TenantDto
                {
                    Id = t.Id,
                    Subdomain = t.Subdomain,
                    CompanyName = t.CompanyName,
                    Status = t.Status,
                    Plan = t.Plan,
                    MaxUsers = t.MaxUsers,
                    AdminEmail = t.AdminEmail,
                    AdminName = t.AdminName,
                    CreatedAt = t.CreatedAt,
                    TrialEndsAt = t.TrialEndsAt,
                    SubscriptionEndsAt = t.SubscriptionEndsAt,
                    LogoUrl = t.LogoUrl,
                    PrimaryColor = t.PrimaryColor
                })
                .ToListAsync();

            return Ok(tenants);
        }

        /// <summary>
        /// Get tenant by ID (super admin only)
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<ActionResult<TenantDto>> GetTenant(int id)
        {
            var tenant = await _masterContext.Tenants.FindAsync(id);
            
            if (tenant == null)
            {
                return NotFound(new { message = "Tenant not found" });
            }

            return Ok(new TenantDto
            {
                Id = tenant.Id,
                Subdomain = tenant.Subdomain,
                CompanyName = tenant.CompanyName,
                Status = tenant.Status,
                Plan = tenant.Plan,
                MaxUsers = tenant.MaxUsers,
                AdminEmail = tenant.AdminEmail,
                AdminName = tenant.AdminName,
                CreatedAt = tenant.CreatedAt,
                TrialEndsAt = tenant.TrialEndsAt,
                SubscriptionEndsAt = tenant.SubscriptionEndsAt,
                LogoUrl = tenant.LogoUrl,
                PrimaryColor = tenant.PrimaryColor
            });
        }

        /// <summary>
        /// Create tenant (super admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<ActionResult<TenantResponse>> CreateTenant([FromBody] CreateTenantAdminRequest request)
        {
            try
            {
                if (await _tenantService.SubdomainExistsAsync(request.Subdomain))
                {
                    return BadRequest(new TenantResponse 
                    { 
                        Success = false, 
                        Message = $"Subdomain '{request.Subdomain}' already exists" 
                    });
                }

                var tenant = await _tenantService.CreateTenantAsync(new CreateTenantRequest
                {
                    Subdomain = request.Subdomain.ToLower(),
                    CompanyName = request.CompanyName,
                    AdminEmail = request.AdminEmail,
                    AdminName = request.AdminName,
                    Plan = request.Plan
                });

                // Update if skip trial
                if (request.SkipTrial)
                {
                    tenant.Status = "Active";
                    tenant.TrialEndsAt = null;
                    await _masterContext.SaveChangesAsync();
                }

                // Update max users if specified
                if (request.MaxUsers.HasValue)
                {
                    tenant.MaxUsers = request.MaxUsers.Value;
                    await _masterContext.SaveChangesAsync();
                }

                _logger.LogInformation("Tenant created by admin: {Subdomain}", tenant.Subdomain);

                return Ok(new TenantResponse
                {
                    Success = true,
                    Message = "Tenant created successfully",
                    TenantId = tenant.Id,
                    Subdomain = tenant.Subdomain,
                    CompanyName = tenant.CompanyName
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Admin failed to create tenant: {Subdomain}", request.Subdomain);
                return StatusCode(500, new TenantResponse 
                { 
                    Success = false, 
                    Message = "Failed to create tenant" 
                });
            }
        }

        /// <summary>
        /// Update tenant (super admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> UpdateTenant(int id, [FromBody] UpdateTenantRequest request)
        {
            var tenant = await _masterContext.Tenants.FindAsync(id);
            
            if (tenant == null)
            {
                return NotFound(new { message = "Tenant not found" });
            }

            // Update only provided fields
            if (!string.IsNullOrEmpty(request.CompanyName))
                tenant.CompanyName = request.CompanyName;
            
            if (!string.IsNullOrEmpty(request.Status))
                tenant.Status = request.Status;
            
            if (!string.IsNullOrEmpty(request.Plan))
                tenant.Plan = request.Plan;
            
            if (request.MaxUsers.HasValue)
                tenant.MaxUsers = request.MaxUsers.Value;
            
            if (request.LogoUrl != null)
                tenant.LogoUrl = request.LogoUrl;
            
            if (request.PrimaryColor != null)
                tenant.PrimaryColor = request.PrimaryColor;
            
            if (request.SubscriptionEndsAt.HasValue)
                tenant.SubscriptionEndsAt = request.SubscriptionEndsAt;

            await _masterContext.SaveChangesAsync();

            _logger.LogInformation("Tenant updated: {TenantId} - {Subdomain}", id, tenant.Subdomain);

            return Ok(new { message = "Tenant updated successfully" });
        }

        /// <summary>
        /// Suspend tenant (super admin only)
        /// </summary>
        [HttpPost("{id}/suspend")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> SuspendTenant(int id)
        {
            var tenant = await _masterContext.Tenants.FindAsync(id);
            
            if (tenant == null)
            {
                return NotFound(new { message = "Tenant not found" });
            }

            tenant.Status = "Suspended";
            await _masterContext.SaveChangesAsync();

            _logger.LogWarning("Tenant suspended: {TenantId} - {Subdomain}", id, tenant.Subdomain);

            return Ok(new { message = "Tenant suspended" });
        }

        /// <summary>
        /// Activate tenant (super admin only)
        /// </summary>
        [HttpPost("{id}/activate")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> ActivateTenant(int id)
        {
            var tenant = await _masterContext.Tenants.FindAsync(id);
            
            if (tenant == null)
            {
                return NotFound(new { message = "Tenant not found" });
            }

            tenant.Status = "Active";
            await _masterContext.SaveChangesAsync();

            _logger.LogInformation("Tenant activated: {TenantId} - {Subdomain}", id, tenant.Subdomain);

            return Ok(new { message = "Tenant activated" });
        }

        /// <summary>
        /// Delete (cancel) tenant (super admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> DeleteTenant(int id)
        {
            var tenant = await _masterContext.Tenants.FindAsync(id);
            
            if (tenant == null)
            {
                return NotFound(new { message = "Tenant not found" });
            }

            // Soft delete - just mark as cancelled
            tenant.Status = "Cancelled";
            await _masterContext.SaveChangesAsync();

            _logger.LogWarning("Tenant cancelled: {TenantId} - {Subdomain}", id, tenant.Subdomain);

            return Ok(new { message = "Tenant cancelled" });
        }

        /// <summary>
        /// Helper method to create the admin user in the tenant's database
        /// </summary>
        private async Task CreateTenantAdminUserAsync(string connectionString, string email, string password, string fullName)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            optionsBuilder.UseSqlServer(connectionString);

            using var tenantContext = new ApplicationDbContext(optionsBuilder.Options);

            // Create admin user
            var adminUser = new TenantUser
            {
                Email = email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                FullName = fullName,
                IsActive = true,
                EmailVerified = true,
                CreatedAt = DateTime.UtcNow
            };

            tenantContext.TenantUsers.Add(adminUser);
            await tenantContext.SaveChangesAsync();

            // Assign Admin role
            var userRole = new UserRole
            {
                UserId = adminUser.Id,
                RoleId = 1, // Admin role
                AssignedAt = DateTime.UtcNow
            };

            tenantContext.UserRoles.Add(userRole);
            await tenantContext.SaveChangesAsync();
        }
    }
}
