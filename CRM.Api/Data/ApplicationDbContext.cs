using Microsoft.EntityFrameworkCore;
using CRM.Api.Models;
using CRM.Api.Models.Auth;
using CRM.Api.Models.Email;
using CRM.Api.Models.Marketing;
using CRM.Api.Models.Reporting;
using NewFields = CRM.Api.Models.CustomFields;

namespace CRM.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Contact> Contacts { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<Opportunity> Opportunities { get; set; }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<HistoryItem> HistoryItems { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<SavedSearch> SavedSearches { get; set; }
        
        // Search & Filtering (Module 9)
        public DbSet<Models.Search.SavedSearch> SearchSavedSearches { get; set; }
        public DbSet<Models.Search.SearchHistory> SearchHistories { get; set; }
        public DbSet<Models.Search.FilterPreset> FilterPresets { get; set; }
        
        // Marketing Automation (Module 7)
        public DbSet<MarketingCampaign> MarketingCampaigns { get; set; }
        public DbSet<MarketingList> MarketingLists { get; set; }
        public DbSet<MarketingListMember> MarketingListMembers { get; set; }
        public DbSet<CampaignStep> CampaignSteps { get; set; }
        public DbSet<CampaignRecipient> CampaignRecipients { get; set; }
        public DbSet<CampaignStepExecutionLog> CampaignStepExecutionLogs { get; set; }
        public DbSet<SuppressionEntry> SuppressionEntries { get; set; }
        public DbSet<LeadScoringRule> LeadScoringRules { get; set; }
        public DbSet<LeadAssignmentRule> LeadAssignmentRules { get; set; }
        
        // Landing Pages (Module 7.3)
        public DbSet<LandingPage> LandingPages { get; set; }
        public DbSet<WebForm> WebForms { get; set; }
        public DbSet<LandingPageSubmission> LandingPageSubmissions { get; set; }
        
        // Reporting & Analytics (Module 8)
        public DbSet<SavedReport> SavedReports { get; set; }
        public DbSet<ReportExecutionLog> ReportExecutionLogs { get; set; }
        
        // New tab-related entities
        public DbSet<ContactPersonalInfo> ContactPersonalInfos { get; set; }
        public DbSet<ContactWebInfo> ContactWebInfos { get; set; }
        public DbSet<ContactWebLink> ContactWebLinks { get; set; }
        public DbSet<ContactCustomField> ContactCustomFields { get; set; }

        // Multiple Emails and Addresses per Contact (Week 1)
        public DbSet<ContactEmail> ContactEmails { get; set; }
        public DbSet<ContactAddress> ContactAddresses { get; set; }

        // Week 4: Relationships & Secondary Contacts
        public DbSet<ContactRelationship> ContactRelationships { get; set; }
        public DbSet<SecondaryContact> SecondaryContacts { get; set; }
        public DbSet<ContactReminder> ContactReminders { get; set; }


        // Email-related entities (Week 11-12)
        public DbSet<EmailTemplate> EmailTemplates { get; set; }
        public DbSet<EmailSignature> EmailSignatures { get; set; }
        public DbSet<SentEmail> SentEmails { get; set; }
        public DbSet<EmailTracking> EmailTrackings { get; set; }
        public DbSet<EmailAttachment> EmailAttachments { get; set; }
        public DbSet<ScheduledEmail> ScheduledEmails { get; set; }

        // Pipeline enhancement entities (Week 13-14)
        public DbSet<StageHistory> StageHistories { get; set; }
        public DbSet<OpportunityProduct> OpportunityProducts { get; set; }

        // Product Catalog (Week 15-16)
        public DbSet<Product> Products { get; set; }
        public DbSet<Quote> Quotes { get; set; }
        public DbSet<QuoteTemplate> QuoteTemplates { get; set; }
        public DbSet<QuoteLineItem> QuoteLineItems { get; set; }
        public DbSet<SalesQuota> SalesQuotas { get; set; }

        // Workflow Automation (Week 16)
        public DbSet<WorkflowRule> WorkflowRules { get; set; }
        public DbSet<WorkflowExecutionLog> WorkflowExecutionLogs { get; set; }

        // Custom Fields (Week 17) - Legacy
        public DbSet<CustomFieldDefinition> CustomFieldDefinitions { get; set; }
        public DbSet<CustomFieldValue> CustomFieldValues { get; set; }

        // New Custom Fields System (SaaS)
        public DbSet<NewFields.CustomField> AppCustomFields { get; set; }
        public DbSet<NewFields.CustomFieldValue> AppCustomFieldValues { get; set; }


        // Tenant Email Configuration (SaaS)
        public DbSet<TenantEmailSettings> TenantEmailSettings { get; set; }

        // Authentication entities (SaaS Multi-tenant)
        public DbSet<TenantUser> TenantUsers { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        // External Integrations (Week 23-24)
        public DbSet<Webhook> Webhooks { get; set; }
        public DbSet<WebhookLog> WebhookLogs { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ========== RELATIONSHIP CONFIGURATIONS ==========
            
            // Configure Contact-Group many-to-many relationship explicitly
            modelBuilder.Entity<Contact>()
                .HasMany(c => c.Groups)
                .WithMany(g => g.Contacts)
                .UsingEntity(j => j.ToTable("ContactGroups"));



            // Configure one-to-one: Contact -> PersonalInfo
            modelBuilder.Entity<ContactPersonalInfo>()
                .HasOne(p => p.Contact)
                .WithOne()
                .HasForeignKey<ContactPersonalInfo>(p => p.ContactId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure one-to-one: Contact -> WebInfo
            modelBuilder.Entity<ContactWebInfo>()
                .HasOne(w => w.Contact)
                .WithOne()
                .HasForeignKey<ContactWebInfo>(w => w.ContactId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure one-to-many: WebInfo -> WebLinks
            modelBuilder.Entity<ContactWebLink>()
                .HasOne(l => l.ContactWebInfo)
                .WithMany(w => w.CustomLinks)
                .HasForeignKey(l => l.ContactWebInfoId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure one-to-many: Contact -> CustomFields
            modelBuilder.Entity<ContactCustomField>()
                .HasOne(f => f.Contact)
                .WithMany()
                .HasForeignKey(f => f.ContactId)
                .OnDelete(DeleteBehavior.Cascade);

            // Week 4: Contact Relationships Configuration
            modelBuilder.Entity<ContactRelationship>()
                .HasOne(r => r.Contact)
                .WithMany()
                .HasForeignKey(r => r.ContactId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascade to avoid cycles

            modelBuilder.Entity<ContactRelationship>()
                .HasOne(r => r.RelatedContact)
                .WithMany()
                .HasForeignKey(r => r.RelatedContactId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascade to avoid cycles

            // Secondary Contacts - Cascade is fine here as it is a direct child
            modelBuilder.Entity<SecondaryContact>()
                .HasOne(s => s.PrimaryContact)
                .WithMany()
                .HasForeignKey(s => s.PrimaryContactId)
                .OnDelete(DeleteBehavior.Cascade);

            // Contact Reminders - Cascade is fine
            modelBuilder.Entity<ContactReminder>()
                .HasOne(r => r.Contact)
                .WithMany()
                .HasForeignKey(r => r.ContactId)
                .OnDelete(DeleteBehavior.Cascade);

            // ========== SEED DATA ==========

            // Seed Company
            modelBuilder.Entity<Company>().HasData(
                new Company { 
                    Id = 1, 
                    Name = "ByteSymphony", 
                    Industry = "Technology", 
                    Website = "https://bytesymphony.co.in", 
                    CreatedAt = new DateTime(2026, 1, 1),
                    LastModifiedAt = new DateTime(2026, 1, 1)
                }
            );

            // Seed Contact
            modelBuilder.Entity<Contact>().HasData(
                new Contact { 
                    Id = 1, 
                    FirstName = "Sameer", 
                    LastName = "MJ", 
                    Email = "sameer.mj@gmail.com", 
                    Phone = "1234567890", 
                    CompanyId = 1, 
                    JobTitle = "CEO", 
                    Status = "Active", 
                    LeadSource = "Direct",
                    CreatedAt = new DateTime(2026, 1, 1),
                    LastModifiedAt = new DateTime(2026, 1, 1)
                }
            );

            // Seed Group
            modelBuilder.Entity<Group>().HasData(
                new Group { Id = 1, Name = "VIP Customers", Description = "High value clients", CreatedAt = new DateTime(2026, 1, 1) }
            );

            // Seed Opportunity
            modelBuilder.Entity<Opportunity>().HasData(
                new Opportunity {
                    Id = 1,
                    Name = "Enterprise CRM implementation",
                    Amount = 50000,
                    Stage = "Proposal",
                    Probability = 75,
                    ExpectedCloseDate = new DateTime(2026, 3, 31),
                    ContactId = 1,
                    CreatedAt = new DateTime(2026, 1, 1),
                    LastModifiedAt = new DateTime(2026, 1, 1),
                    Description = "Full CRM suite for 100 users",
                    WeightedValue = 37500, // 50000 * 0.75
                    DealScore = 75,
                    DealHealth = "Healthy",
                    Source = "Referral",
                    Type = "New Business",
                    NextAction = "Send proposal document",
                    NextActionDate = new DateTime(2026, 1, 20),
                    ForecastCategory = "Commit"
                }
            );

            // Seed Activity
            modelBuilder.Entity<Activity>().HasData(
                new Activity {
                    Id = 1,
                    Subject = "Introductory Call",
                    Type = "Call",
                    StartTime = new DateTime(2026, 1, 15, 10, 0, 0),
                    EndTime = new DateTime(2026, 1, 15, 10, 30, 0),
                    IsCompleted = false,
                    ContactId = 1,
                    Priority = "High",
                    CreatedAt = new DateTime(2026, 1, 1)
                }
            );

            // Seed History
            modelBuilder.Entity<HistoryItem>().HasData(
                new HistoryItem { Id = 1, Type = "Call", Result = "Left Message", Regarding = "Follow-up on inquiry", Date = new DateTime(2026, 1, 2, 14, 0, 0), ContactId = 1, DurationMinutes = 5 },
                new HistoryItem { Id = 2, Type = "Note", Result = "Completed", Regarding = "Client requirements gathering", Date = new DateTime(2026, 1, 5, 10, 0, 0), ContactId = 1, Details = "Discussed needs for 100 users." },
                new HistoryItem { Id = 3, Type = "EmailSent", Result = "Sent", Regarding = "Proposal Document", Date = new DateTime(2026, 1, 8, 9, 30, 0), ContactId = 1 }
            );

            // Seed Users
            modelBuilder.Entity<User>().HasData(
                new User { Id = 1, Username = "admin", FullName = "System Administrator", Email = "admin@nexus-crm.io", Role = "Admin", IsActive = true, CreatedAt = new DateTime(2026, 1, 1) },
                new User { Id = 2, Username = "sameer", FullName = "Sameer MJ", Email = "sameer.mj@gmail.com", Role = "Manager", IsActive = true, CreatedAt = new DateTime(2026, 1, 1) },
                new User { Id = 3, Username = "sales1", FullName = "John Sales", Email = "john.s@nexus-crm.io", Role = "User", IsActive = true, CreatedAt = new DateTime(2026, 1, 5) }
            );

            // Email entity configurations (Week 11-12)
            modelBuilder.Entity<SentEmail>()
                .HasOne(e => e.Contact)
                .WithMany()
                .HasForeignKey(e => e.ContactId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<SentEmail>()
                .HasOne(e => e.Template)
                .WithMany()
                .HasForeignKey(e => e.TemplateId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<EmailTracking>()
                .HasOne(t => t.SentEmail)
                .WithOne(e => e.Tracking)
                .HasForeignKey<EmailTracking>(t => t.SentEmailId)
                .OnDelete(DeleteBehavior.Cascade);

            // ========== AUTH ENTITY CONFIGURATIONS ==========
            
            // RolePermission - composite key
            modelBuilder.Entity<RolePermission>()
                .HasKey(rp => new { rp.RoleId, rp.PermissionId });
            
            modelBuilder.Entity<RolePermission>()
                .HasOne(rp => rp.Role)
                .WithMany(r => r.RolePermissions)
                .HasForeignKey(rp => rp.RoleId);
            
            modelBuilder.Entity<RolePermission>()
                .HasOne(rp => rp.Permission)
                .WithMany(p => p.RolePermissions)
                .HasForeignKey(rp => rp.PermissionId);

            // UserRole - composite key
            modelBuilder.Entity<UserRole>()
                .HasKey(ur => new { ur.UserId, ur.RoleId });
            
            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(ur => ur.UserId);
            
            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleId);

            // RefreshToken
            modelBuilder.Entity<RefreshToken>()
                .HasOne(rt => rt.User)
                .WithMany()
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // TenantUser
            modelBuilder.Entity<TenantUser>()
                .HasIndex(u => u.Email).IsUnique();

            // Role
            modelBuilder.Entity<Role>()
                .HasIndex(r => r.Name);

            // Permission
            modelBuilder.Entity<Permission>()
                .HasIndex(p => p.Code).IsUnique();

            // ========== SEED DEFAULT ROLES ==========
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Admin", Description = "Full system access", IsSystemRole = true, CreatedAt = new DateTime(2026, 1, 1) },
                new Role { Id = 2, Name = "Manager", Description = "Can manage users and view reports", IsSystemRole = true, CreatedAt = new DateTime(2026, 1, 1) },
                new Role { Id = 3, Name = "User", Description = "Standard user access", IsSystemRole = true, CreatedAt = new DateTime(2026, 1, 1) }
            );

            // ========== SEED PERMISSIONS ==========
            modelBuilder.Entity<Permission>().HasData(
                // Contacts
                new Permission { Id = 1, Code = "contacts.view", Name = "View Contacts", Category = "Contacts" },
                new Permission { Id = 2, Code = "contacts.create", Name = "Create Contacts", Category = "Contacts" },
                new Permission { Id = 3, Code = "contacts.edit", Name = "Edit Contacts", Category = "Contacts" },
                new Permission { Id = 4, Code = "contacts.delete", Name = "Delete Contacts", Category = "Contacts" },
                new Permission { Id = 5, Code = "contacts.export", Name = "Export Contacts", Category = "Contacts" },
                new Permission { Id = 6, Code = "contacts.import", Name = "Import Contacts", Category = "Contacts" },
                // Companies
                new Permission { Id = 7, Code = "companies.view", Name = "View Companies", Category = "Companies" },
                new Permission { Id = 8, Code = "companies.create", Name = "Create Companies", Category = "Companies" },
                new Permission { Id = 9, Code = "companies.edit", Name = "Edit Companies", Category = "Companies" },
                new Permission { Id = 10, Code = "companies.delete", Name = "Delete Companies", Category = "Companies" },
                // Opportunities
                new Permission { Id = 11, Code = "opportunities.view", Name = "View Opportunities", Category = "Opportunities" },
                new Permission { Id = 12, Code = "opportunities.create", Name = "Create Opportunities", Category = "Opportunities" },
                new Permission { Id = 13, Code = "opportunities.edit", Name = "Edit Opportunities", Category = "Opportunities" },
                new Permission { Id = 14, Code = "opportunities.delete", Name = "Delete Opportunities", Category = "Opportunities" },
                new Permission { Id = 15, Code = "opportunities.pipeline", Name = "Access Pipeline", Category = "Opportunities" },
                // Activities
                new Permission { Id = 16, Code = "activities.view", Name = "View Activities", Category = "Activities" },
                new Permission { Id = 17, Code = "activities.create", Name = "Create Activities", Category = "Activities" },
                new Permission { Id = 18, Code = "activities.edit", Name = "Edit Activities", Category = "Activities" },
                new Permission { Id = 19, Code = "activities.delete", Name = "Delete Activities", Category = "Activities" },
                // Reports
                new Permission { Id = 20, Code = "reports.view", Name = "View Reports", Category = "Reports" },
                new Permission { Id = 21, Code = "reports.create", Name = "Create Reports", Category = "Reports" },
                new Permission { Id = 22, Code = "reports.export", Name = "Export Reports", Category = "Reports" },
                // Marketing
                new Permission { Id = 23, Code = "marketing.view", Name = "View Campaigns", Category = "Marketing" },
                new Permission { Id = 24, Code = "marketing.create", Name = "Create Campaigns", Category = "Marketing" },
                new Permission { Id = 25, Code = "marketing.send", Name = "Send Campaigns", Category = "Marketing" },
                // Admin
                new Permission { Id = 26, Code = "admin.users", Name = "Manage Users", Category = "Admin" },
                new Permission { Id = 27, Code = "admin.roles", Name = "Manage Roles", Category = "Admin" },
                new Permission { Id = 28, Code = "admin.settings", Name = "Manage Settings", Category = "Admin" }
            );

            // ========== SEED ADMIN ROLE PERMISSIONS (all permissions) ==========
            var adminPermissions = Enumerable.Range(1, 28).Select(i => new RolePermission { RoleId = 1, PermissionId = i });
            modelBuilder.Entity<RolePermission>().HasData(adminPermissions);

            // ========== SEED MANAGER ROLE PERMISSIONS ==========
            modelBuilder.Entity<RolePermission>().HasData(
                // Contacts (view, create, edit)
                new RolePermission { RoleId = 2, PermissionId = 1 },
                new RolePermission { RoleId = 2, PermissionId = 2 },
                new RolePermission { RoleId = 2, PermissionId = 3 },
                new RolePermission { RoleId = 2, PermissionId = 5 },
                // Companies (view, create, edit)
                new RolePermission { RoleId = 2, PermissionId = 7 },
                new RolePermission { RoleId = 2, PermissionId = 8 },
                new RolePermission { RoleId = 2, PermissionId = 9 },
                // Opportunities (all except delete)
                new RolePermission { RoleId = 2, PermissionId = 11 },
                new RolePermission { RoleId = 2, PermissionId = 12 },
                new RolePermission { RoleId = 2, PermissionId = 13 },
                new RolePermission { RoleId = 2, PermissionId = 15 },
                // Activities (all except delete)
                new RolePermission { RoleId = 2, PermissionId = 16 },
                new RolePermission { RoleId = 2, PermissionId = 17 },
                new RolePermission { RoleId = 2, PermissionId = 18 },
                // Reports (view, export)
                new RolePermission { RoleId = 2, PermissionId = 20 },
                new RolePermission { RoleId = 2, PermissionId = 22 },
                // Admin (users only)
                new RolePermission { RoleId = 2, PermissionId = 26 }
            );

            // ========== SEED USER ROLE PERMISSIONS ==========
            modelBuilder.Entity<RolePermission>().HasData(
                // Contacts (view, create, edit)
                new RolePermission { RoleId = 3, PermissionId = 1 },
                new RolePermission { RoleId = 3, PermissionId = 2 },
                new RolePermission { RoleId = 3, PermissionId = 3 },
                // Companies (view only)
                new RolePermission { RoleId = 3, PermissionId = 7 },
                // Opportunities (view, create, edit, pipeline)
                new RolePermission { RoleId = 3, PermissionId = 11 },
                new RolePermission { RoleId = 3, PermissionId = 12 },
                new RolePermission { RoleId = 3, PermissionId = 13 },
                new RolePermission { RoleId = 3, PermissionId = 15 },
                // Activities (view, create, edit)
                new RolePermission { RoleId = 3, PermissionId = 16 },
                new RolePermission { RoleId = 3, PermissionId = 17 },
                new RolePermission { RoleId = 3, PermissionId = 18 },
                // Reports (view only)
                new RolePermission { RoleId = 3, PermissionId = 20 }
            );

            // ========== SEED DEFAULT TENANT USER (Admin) ==========
            // Password: Admin@123 (BCrypt hash)
            modelBuilder.Entity<TenantUser>().HasData(
                new TenantUser
                {
                    Id = 1,
                    Email = "admin@demo.com",
                    PasswordHash = "$2a$11$rBNPU0G4vPCn7e2RP9vy0OoEFq9X6p5Yb5U3HYvWkPr4D7o6eYZOa",
                    FullName = "Demo Admin",
                    FirstName = "Demo",
                    LastName = "Admin",
                    IsActive = true,
                    EmailVerified = true,
                    CreatedAt = new DateTime(2026, 1, 1)
                }
            );

            // Assign Admin role to default user
            modelBuilder.Entity<UserRole>().HasData(
                new UserRole { UserId = 1, RoleId = 1, AssignedAt = new DateTime(2026, 1, 1) }
            );

        }
    }
}
