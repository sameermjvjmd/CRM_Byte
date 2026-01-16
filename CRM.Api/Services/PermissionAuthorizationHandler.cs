using Microsoft.AspNetCore.Authorization;

namespace CRM.Api.Services
{
    /// <summary>
    /// Custom authorization handler that checks for permission claims.
    /// </summary>
    public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
    {
        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            PermissionRequirement requirement)
        {
            // Check if user has the required permission claim
            var hasPermission = context.User.Claims
                .Any(c => c.Type == "permission" && c.Value == requirement.Permission);

            // Also check if user is Admin (has all permissions)
            var isAdmin = context.User.IsInRole("Admin");

            if (hasPermission || isAdmin)
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }
    }

    /// <summary>
    /// Requirement for permission-based authorization.
    /// </summary>
    public class PermissionRequirement : IAuthorizationRequirement
    {
        public string Permission { get; }

        public PermissionRequirement(string permission)
        {
            Permission = permission;
        }
    }

    /// <summary>
    /// Extension methods for adding permission-based policies.
    /// </summary>
    public static class PermissionAuthorizationExtensions
    {
        /// <summary>
        /// Adds permission-based authorization policies.
        /// </summary>
        public static IServiceCollection AddPermissionAuthorization(this IServiceCollection services)
        {
            services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();

            services.AddAuthorization(options =>
            {
                // Add policies for each permission
                var permissions = new[]
                {
                    // Contacts
                    "contacts.view", "contacts.create", "contacts.edit", "contacts.delete", "contacts.export", "contacts.import",
                    // Companies
                    "companies.view", "companies.create", "companies.edit", "companies.delete",
                    // Opportunities
                    "opportunities.view", "opportunities.create", "opportunities.edit", "opportunities.delete", "opportunities.pipeline",
                    // Activities
                    "activities.view", "activities.create", "activities.edit", "activities.delete",
                    // Reports
                    "reports.view", "reports.create", "reports.export",
                    // Marketing
                    "marketing.view", "marketing.create", "marketing.send",
                    // Admin
                    "admin.users", "admin.roles", "admin.settings"
                };

                foreach (var permission in permissions)
                {
                    options.AddPolicy(permission, policy =>
                        policy.Requirements.Add(new PermissionRequirement(permission)));
                }
            });

            return services;
        }
    }
}
