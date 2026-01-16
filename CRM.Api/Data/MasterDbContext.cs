using Microsoft.EntityFrameworkCore;
using CRM.Api.Models.Tenant;

namespace CRM.Api.Data
{
    /// <summary>
    /// Database context for the Master database.
    /// Contains tenant registry, super admins, and invitations.
    /// This is separate from tenant databases.
    /// </summary>
    public class MasterDbContext : DbContext
    {
        public MasterDbContext(DbContextOptions<MasterDbContext> options)
            : base(options)
        {
        }

        public DbSet<TenantInfo> Tenants { get; set; }
        public DbSet<SuperAdmin> SuperAdmins { get; set; }
        public DbSet<TenantInvitation> TenantInvitations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Tenant configuration
            modelBuilder.Entity<TenantInfo>(entity =>
            {
                entity.HasIndex(e => e.Subdomain).IsUnique();
                entity.HasIndex(e => e.AdminEmail);
            });

            // SuperAdmin configuration
            modelBuilder.Entity<SuperAdmin>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // TenantInvitation configuration
            modelBuilder.Entity<TenantInvitation>(entity =>
            {
                entity.HasIndex(e => e.Token).IsUnique();
                entity.HasOne(e => e.Tenant)
                    .WithMany()
                    .HasForeignKey(e => e.TenantId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Seed default super admin
            // Password: Admin@123 (BCrypt hash)
            modelBuilder.Entity<SuperAdmin>().HasData(
                new SuperAdmin
                {
                    Id = 1,
                    Email = "admin@nexuscrm.com",
                    PasswordHash = "$2a$11$rBNPU0G4vPCn7e2RP9vy0OoEFq9X6p5Yb5U3HYvWkPr4D7o6eYZOa", // Admin@123
                    FullName = "System Administrator",
                    IsActive = true,
                    CreatedAt = new DateTime(2026, 1, 1)
                }
            );

            // Seed a demo tenant
            modelBuilder.Entity<TenantInfo>().HasData(
                new TenantInfo
                {
                    Id = 1,
                    Subdomain = "demo",
                    CompanyName = "Demo Company",
                    DatabaseName = "NexusCRM_Demo",
                    Status = "Active",
                    Plan = "Pro",
                    MaxUsers = 50,
                    AdminEmail = "admin@demo.com",
                    AdminName = "Demo Admin",
                    CreatedAt = new DateTime(2026, 1, 1)
                }
            );
        }
    }
}
