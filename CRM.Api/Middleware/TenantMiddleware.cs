using CRM.Api.Services;

namespace CRM.Api.Middleware
{
    /// <summary>
    /// Middleware that resolves tenant from subdomain and sets the tenant context.
    /// This runs before any controller logic and determines which database to use.
    /// </summary>
    public class TenantMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<TenantMiddleware> _logger;

        // Paths that don't require tenant resolution
        private readonly string[] _excludedPaths = 
        {
            "/api/tenants/register",  // Self-service tenant registration
            "/api/tenants/check-subdomain",
            "/openapi",
            "/swagger",
            "/health"
        };

        // Subdomains that are reserved and should use default database
        private readonly string[] _reservedSubdomains = 
        {
            "www",
            "api",
            "app",
            "admin",
            "localhost",
            "127.0.0.1"
        };

        public TenantMiddleware(RequestDelegate next, ILogger<TenantMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, ITenantContext tenantContext, ITenantService tenantService)
        {
            var path = context.Request.Path.Value ?? "";
            
            // Skip tenant resolution for excluded paths
            if (_excludedPaths.Any(p => path.StartsWith(p, StringComparison.OrdinalIgnoreCase)))
            {
                await _next(context);
                return;
            }

            // Extract subdomain from host
            var host = context.Request.Host.Host;
            var subdomain = ExtractSubdomain(host);

            _logger.LogDebug("Host: {Host}, Extracted subdomain: {Subdomain}", host, subdomain);

            // If no subdomain or reserved subdomain, use default database
            if (string.IsNullOrEmpty(subdomain) || _reservedSubdomains.Contains(subdomain.ToLower()))
            {
                _logger.LogDebug("Using default database (no tenant subdomain)");
                await _next(context);
                return;
            }

            // Resolve tenant from subdomain
            var tenant = await tenantService.GetTenantBySubdomainAsync(subdomain);
            
            if (tenant == null)
            {
                _logger.LogWarning("Tenant not found for subdomain: {Subdomain}", subdomain);
                context.Response.StatusCode = 404;
                await context.Response.WriteAsJsonAsync(new 
                { 
                    error = "Tenant not found",
                    message = $"No organization found for subdomain '{subdomain}'"
                });
                return;
            }

            // Check if tenant is active
            if (tenant.Status == "Suspended")
            {
                _logger.LogWarning("Tenant is suspended: {Subdomain}", subdomain);
                context.Response.StatusCode = 403;
                await context.Response.WriteAsJsonAsync(new 
                { 
                    error = "Account suspended",
                    message = "This account has been suspended. Please contact support."
                });
                return;
            }

            if (tenant.Status == "Cancelled")
            {
                context.Response.StatusCode = 404;
                await context.Response.WriteAsJsonAsync(new 
                { 
                    error = "Account cancelled",
                    message = "This account no longer exists."
                });
                return;
            }

            // Check trial expiration
            if (tenant.Status == "Trial" && tenant.TrialEndsAt.HasValue && tenant.TrialEndsAt.Value < DateTime.UtcNow)
            {
                _logger.LogWarning("Tenant trial expired: {Subdomain}", subdomain);
                context.Response.StatusCode = 402; // Payment Required
                await context.Response.WriteAsJsonAsync(new 
                { 
                    error = "Trial expired",
                    message = "Your trial period has ended. Please upgrade to continue."
                });
                return;
            }

            // Set tenant context
            var connectionString = tenant.ConnectionString ?? tenantService.BuildConnectionString(tenant.DatabaseName);
            tenantContext.SetTenant(
                tenant.Id, 
                tenant.Subdomain, 
                tenant.CompanyName, 
                connectionString,
                tenant.Plan
            );

            _logger.LogInformation("Tenant resolved: {TenantId} - {CompanyName} ({Subdomain})", 
                tenant.Id, tenant.CompanyName, tenant.Subdomain);

            // Also store in HttpContext.Items for easy access
            context.Items["TenantId"] = tenant.Id;
            context.Items["TenantSubdomain"] = tenant.Subdomain;
            context.Items["TenantCompanyName"] = tenant.CompanyName;

            await _next(context);
        }

        private string? ExtractSubdomain(string host)
        {
            // Remove port if present
            var hostWithoutPort = host.Split(':')[0];
            
            // Split by dots
            var parts = hostWithoutPort.Split('.');

            // For localhost or IP addresses, there's no subdomain
            if (parts.Length <= 1 || hostWithoutPort == "localhost")
            {
                return null;
            }

            // For standard domains like "tenant.nexuscrm.com"
            // The subdomain is the first part
            if (parts.Length >= 3)
            {
                return parts[0];
            }

            // For development like "tenant.localhost"
            if (parts.Length == 2 && parts[1] == "localhost")
            {
                return parts[0];
            }

            return null;
        }
    }

    // Extension method for registering the middleware
    public static class TenantMiddlewareExtensions
    {
        public static IApplicationBuilder UseTenantMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<TenantMiddleware>();
        }
    }
}
