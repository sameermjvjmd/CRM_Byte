namespace CRM.Api.Services
{
    /// <summary>
    /// Interface for accessing current tenant information.
    /// This is scoped per-request and set by the TenantMiddleware.
    /// </summary>
    public interface ITenantContext
    {
        int? TenantId { get; }
        string? Subdomain { get; }
        string? CompanyName { get; }
        string? ConnectionString { get; }
        string? Plan { get; }
        bool IsResolved { get; }
        
        void SetTenant(int tenantId, string subdomain, string companyName, string connectionString, string plan);
        void Clear();
    }

    /// <summary>
    /// Thread-safe, scoped tenant context.
    /// Each HTTP request gets its own instance.
    /// </summary>
    public class TenantContext : ITenantContext
    {
        public int? TenantId { get; private set; }
        public string? Subdomain { get; private set; }
        public string? CompanyName { get; private set; }
        public string? ConnectionString { get; private set; }
        public string? Plan { get; private set; }
        public bool IsResolved { get; private set; }

        public void SetTenant(int tenantId, string subdomain, string companyName, string connectionString, string plan)
        {
            TenantId = tenantId;
            Subdomain = subdomain;
            CompanyName = companyName;
            ConnectionString = connectionString;
            Plan = plan;
            IsResolved = true;
        }

        public void Clear()
        {
            TenantId = null;
            Subdomain = null;
            CompanyName = null;
            ConnectionString = null;
            Plan = null;
            IsResolved = false;
        }
    }
}
