using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models.Tenant;

namespace CRM.Api.Services
{
    /// <summary>
    /// Service for resolving tenant information from subdomain.
    /// </summary>
    public interface ITenantService
    {
        Task<TenantInfo?> GetTenantBySubdomainAsync(string subdomain);
        Task<TenantInfo?> GetTenantByIdAsync(int tenantId);
        Task<List<TenantInfo>> GetAllTenantsAsync();
        Task<TenantInfo> CreateTenantAsync(CreateTenantRequest request);
        Task<bool> SubdomainExistsAsync(string subdomain);
        string BuildConnectionString(string databaseName);
    }

    public class TenantService : ITenantService
    {
        private readonly MasterDbContext _masterContext;
        private readonly IConfiguration _configuration;

        public TenantService(MasterDbContext masterContext, IConfiguration configuration)
        {
            _masterContext = masterContext;
            _configuration = configuration;
        }

        public async Task<TenantInfo?> GetTenantBySubdomainAsync(string subdomain)
        {
            return await _masterContext.Tenants
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Subdomain.ToLower() == subdomain.ToLower() && t.Status != "Cancelled");
        }

        public async Task<TenantInfo?> GetTenantByIdAsync(int tenantId)
        {
            return await _masterContext.Tenants
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == tenantId);
        }

        public async Task<List<TenantInfo>> GetAllTenantsAsync()
        {
            return await _masterContext.Tenants
                .AsNoTracking()
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> SubdomainExistsAsync(string subdomain)
        {
            return await _masterContext.Tenants
                .AnyAsync(t => t.Subdomain.ToLower() == subdomain.ToLower());
        }

        public async Task<TenantInfo> CreateTenantAsync(CreateTenantRequest request)
        {
            // Validate subdomain doesn't exist
            if (await SubdomainExistsAsync(request.Subdomain))
            {
                throw new InvalidOperationException($"Subdomain '{request.Subdomain}' already exists");
            }

            var databaseName = $"NexusCRM_{SanitizeDatabaseName(request.Subdomain)}";
            var connectionString = BuildConnectionString(databaseName);

            var tenantSettings = _configuration.GetSection("TenantSettings");
            var trialDays = int.Parse(tenantSettings["TrialDays"] ?? "14");
            var maxFreeUsers = int.Parse(tenantSettings["MaxFreeUsers"] ?? "5");

            var tenant = new TenantInfo
            {
                Subdomain = request.Subdomain.ToLower(),
                CompanyName = request.CompanyName,
                DatabaseName = databaseName,
                ConnectionString = connectionString,
                Status = "Trial",
                Plan = request.Plan ?? "Free",
                MaxUsers = request.Plan == "Pro" ? 50 : (request.Plan == "Enterprise" ? 500 : maxFreeUsers),
                AdminEmail = request.AdminEmail,
                AdminName = request.AdminName,
                TrialEndsAt = DateTime.UtcNow.AddDays(trialDays),
                CreatedAt = DateTime.UtcNow
            };

            _masterContext.Tenants.Add(tenant);
            await _masterContext.SaveChangesAsync();

            // Create the tenant database
            await CreateTenantDatabaseAsync(connectionString);

            return tenant;
        }

        public string BuildConnectionString(string databaseName)
        {
            var baseConnectionString = _configuration.GetConnectionString("DefaultConnection") ?? "";
            
            // Replace database name in connection string
            // Format: Server=xxx;Database=yyy;...
            var parts = baseConnectionString.Split(';');
            var newParts = parts.Select(p =>
            {
                if (p.Trim().StartsWith("Database=", StringComparison.OrdinalIgnoreCase))
                {
                    return $"Database={databaseName}";
                }
                return p;
            });

            return string.Join(";", newParts);
        }

        private string SanitizeDatabaseName(string subdomain)
        {
            // Remove any characters that aren't alphanumeric or underscore
            return new string(subdomain
                .Where(c => char.IsLetterOrDigit(c) || c == '_')
                .ToArray());
        }

        private async Task CreateTenantDatabaseAsync(string connectionString)
        {
            // Create a new DbContext with the tenant's connection string
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            optionsBuilder.UseSqlServer(connectionString);

            using var tenantContext = new ApplicationDbContext(optionsBuilder.Options);
            
            // Create and migrate the database
            await tenantContext.Database.MigrateAsync();
        }
    }

    public class CreateTenantRequest
    {
        public string Subdomain { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string AdminEmail { get; set; } = string.Empty;
        public string? AdminName { get; set; }
        public string? Plan { get; set; }
    }
}
