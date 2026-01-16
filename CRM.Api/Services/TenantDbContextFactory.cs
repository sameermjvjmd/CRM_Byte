using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;

namespace CRM.Api.Services
{
    /// <summary>
    /// Factory for creating ApplicationDbContext with dynamic connection strings.
    /// Uses the current tenant's connection string when available.
    /// </summary>
    public interface ITenantDbContextFactory
    {
        ApplicationDbContext CreateContext();
    }

    public class TenantDbContextFactory : ITenantDbContextFactory
    {
        private readonly ITenantContext _tenantContext;
        private readonly IConfiguration _configuration;
        private readonly IServiceProvider _serviceProvider;

        public TenantDbContextFactory(
            ITenantContext tenantContext, 
            IConfiguration configuration,
            IServiceProvider serviceProvider)
        {
            _tenantContext = tenantContext;
            _configuration = configuration;
            _serviceProvider = serviceProvider;
        }

        public ApplicationDbContext CreateContext()
        {
            // Get connection string - use tenant's if available, otherwise default
            var connectionString = _tenantContext.IsResolved && !string.IsNullOrEmpty(_tenantContext.ConnectionString)
                ? _tenantContext.ConnectionString
                : _configuration.GetConnectionString("DefaultConnection");

            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            optionsBuilder.UseSqlServer(connectionString);

            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
}
