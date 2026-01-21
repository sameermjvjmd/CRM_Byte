using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using CRM.Api.Data;
using CRM.Api.Services;
using CRM.Api.Services.Email;
using CRM.Api.Services.Security;
using CRM.Api.Middleware;
using CRM.Api.Services.Import;
using CRM.Api.Services.DataQuality;
using CRM.Api.Services.Webhooks;
using AspNetCoreRateLimit;
using QuestPDF.Infrastructure;

// Configure QuestPDF license (Community is free)
QuestPDF.Settings.License = LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Database Contexts
builder.Services.AddDbContext<ApplicationDbContext>((sp, options) =>
{
    var tenantContext = sp.GetService<ITenantContext>();
    var connectionString = tenantContext?.ConnectionString;

    if (string.IsNullOrEmpty(connectionString))
    {
        connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    }

    options.UseSqlServer(connectionString);
});

builder.Services.AddDbContext<MasterDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("MasterConnection")));

// Tenant Services (Multi-tenant SaaS)
builder.Services.AddScoped<ITenantContext, TenantContext>();
builder.Services.AddScoped<ITenantService, TenantService>();
builder.Services.AddScoped<ITenantDbContextFactory, TenantDbContextFactory>();

// Auth Services
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();
// Data Quality
// Data Quality
builder.Services.AddScoped<IImportService, ImportService>();
builder.Services.AddScoped<IDuplicateService, DuplicateService>();

// Email Services
// Email Services
builder.Services.AddScoped<IEmailService, SmtpEmailService>();

// Workflow Automation
builder.Services.AddScoped<WorkflowExecutionService>();
builder.Services.AddScoped<CRM.Api.Services.Marketing.ILeadScoringService, CRM.Api.Services.Marketing.LeadScoringService>();
builder.Services.AddScoped<CRM.Api.Services.Marketing.ICampaignExecutionService, CRM.Api.Services.Marketing.CampaignExecutionService>();
builder.Services.AddScoped<CRM.Api.Services.Marketing.IDynamicListService, CRM.Api.Services.Marketing.DynamicListService>();
builder.Services.AddHostedService<WorkflowBackgroundService>();

// Email Scheduler (Background Service for Scheduled Emails)
builder.Services.AddHostedService<EmailSchedulerBackgroundService>();

// Deal Scoring (Background Service for Opportunity Health Scoring)
builder.Services.AddHostedService<DealScoringBackgroundService>();

// Reporting Services
builder.Services.AddScoped<CRM.Api.Services.Reporting.IReportBuilderService, CRM.Api.Services.Reporting.ReportBuilderService>();
builder.Services.AddScoped<CRM.Api.Services.Reporting.IPdfExportService, CRM.Api.Services.Reporting.PdfExportService>();
builder.Services.AddScoped<CRM.Api.Services.Reporting.IExcelExportService, CRM.Api.Services.Reporting.ExcelExportService>();

// Security Services
builder.Services.AddSingleton<IEncryptionService, EncryptionService>();

// Search Services
builder.Services.AddScoped<CRM.Api.Services.Search.ISearchService, CRM.Api.Services.Search.SearchService>();

// Webhook Services (External Integrations)
builder.Services.AddScoped<IWebhookService, WebhookService>();
builder.Services.AddScoped<ICustomFieldService, CustomFieldService>();
builder.Services.AddHttpClient(); // For webhook HTTP requests

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "DefaultSecretKeyForDevelopmentOnly123!";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "NexusCRM",
        ValidAudience = jwtSettings["Audience"] ?? "NexusCRM-Users",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddPermissionAuthorization();

// API Rate Limiting
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(options =>
{
    options.EnableEndpointRateLimiting = true;
    options.StackBlockedRequests = false;
    options.HttpStatusCode = 429;
    options.RealIpHeader = "X-Real-IP";
    options.GeneralRules = new List<RateLimitRule>
    {
        new RateLimitRule
        {
            Endpoint = "*",
            Period = "1m",
            Limit = 100 // 100 requests per minute
        },
        new RateLimitRule
        {
            Endpoint = "*",
            Period = "1h",
            Limit = 1000 // 1000 requests per hour
        }
    };
});
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
builder.Services.AddInMemoryRateLimiting();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Enable CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // Dev only middleware if any
}

app.UseCors("AllowAll");

// Tenant Resolution Middleware (before authentication)
app.UseTenantMiddleware();

// Rate Limiting Middleware
app.UseIpRateLimiting();

// Authentication & Authorization middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

if (app.Environment.IsDevelopment() || true)
{
    app.MapOpenApi().AllowAnonymous();
    app.MapScalarApiReference(options => 
    {
        options
            .WithTitle("Nexus CRM API Reference")
            .WithTheme(ScalarTheme.Purple)
            .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
    }).AllowAnonymous();
}

// Initialize Databases
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    
    // Initialize default tenant database (existing)
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        
        // EMERGENCY FIX: Manually create Quotes tables if missing
        try {
            // 1. QuoteTemplates
            context.Database.ExecuteSqlRaw(@"
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='QuoteTemplates' AND xtype='U')
                BEGIN
                    CREATE TABLE [QuoteTemplates] (
                        [Id] int NOT NULL IDENTITY,
                        [Name] nvarchar(100) NOT NULL,
                        [CompanyName] nvarchar(200) NOT NULL DEFAULT 'Your Company Name',
                        [CompanyAddress] nvarchar(500) NOT NULL DEFAULT '123 Business Street',
                        [CompanyLogoUrl] nvarchar(max) NULL,
                        [PrimaryColor] nvarchar(20) NOT NULL DEFAULT '#4f46e5',
                        [SecondaryColor] nvarchar(20) NOT NULL DEFAULT '#64748b',
                        [TextColor] nvarchar(20) NULL DEFAULT '#0f172a',
                        [ShowSku] bit NOT NULL DEFAULT 1,
                        [ShowQuantity] bit NOT NULL DEFAULT 1,
                        [ShowDiscountColumn] bit NOT NULL DEFAULT 1,
                        [ShowTaxSummary] bit NOT NULL DEFAULT 1,
                        [ShowShipping] bit NOT NULL DEFAULT 1,
                        [ShowNotes] bit NOT NULL DEFAULT 1,
                        [DefaultTerms] nvarchar(max) NULL,
                        [DefaultFooter] nvarchar(max) NULL DEFAULT 'Thank you for your business!',
                        [IsDefault] bit NOT NULL,
                        [CreatedAt] datetime2 NOT NULL,
                        CONSTRAINT [PK_QuoteTemplates] PRIMARY KEY ([Id])
                    );
                END
            ");

            // 1.1 Fix QuoteTemplates Schema (Add missing columns if table exists but columns don't)
            context.Database.ExecuteSqlRaw(@"
                IF EXISTS (SELECT * FROM sysobjects WHERE name='QuoteTemplates' AND xtype='U')
                BEGIN
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('QuoteTemplates') AND name = 'CompanyName')
                        ALTER TABLE [QuoteTemplates] ADD [CompanyName] nvarchar(200) NOT NULL DEFAULT 'Your Company Name' WITH VALUES;
                    
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('QuoteTemplates') AND name = 'CompanyAddress')
                        ALTER TABLE [QuoteTemplates] ADD [CompanyAddress] nvarchar(500) NOT NULL DEFAULT '123 Business Street' WITH VALUES;

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('QuoteTemplates') AND name = 'CompanyLogoUrl')
                        ALTER TABLE [QuoteTemplates] ADD [CompanyLogoUrl] nvarchar(max) NULL;

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('QuoteTemplates') AND name = 'PrimaryColor')
                        ALTER TABLE [QuoteTemplates] ADD [PrimaryColor] nvarchar(20) NOT NULL DEFAULT '#4f46e5' WITH VALUES;

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('QuoteTemplates') AND name = 'SecondaryColor')
                        ALTER TABLE [QuoteTemplates] ADD [SecondaryColor] nvarchar(20) NOT NULL DEFAULT '#64748b' WITH VALUES;

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('QuoteTemplates') AND name = 'TextColor')
                        ALTER TABLE [QuoteTemplates] ADD [TextColor] nvarchar(20) NULL DEFAULT '#0f172a' WITH VALUES;

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('QuoteTemplates') AND name = 'ShowSku')
                        ALTER TABLE [QuoteTemplates] ADD [ShowSku] bit NOT NULL DEFAULT 1 WITH VALUES;

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('QuoteTemplates') AND name = 'ShowQuantity')
                        ALTER TABLE [QuoteTemplates] ADD [ShowQuantity] bit NOT NULL DEFAULT 1 WITH VALUES;

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('QuoteTemplates') AND name = 'ShowDiscountColumn')
                        ALTER TABLE [QuoteTemplates] ADD [ShowDiscountColumn] bit NOT NULL DEFAULT 1 WITH VALUES;

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('QuoteTemplates') AND name = 'ShowTaxSummary')
                        ALTER TABLE [QuoteTemplates] ADD [ShowTaxSummary] bit NOT NULL DEFAULT 1 WITH VALUES;

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('QuoteTemplates') AND name = 'ShowShipping')
                        ALTER TABLE [QuoteTemplates] ADD [ShowShipping] bit NOT NULL DEFAULT 1 WITH VALUES;

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('QuoteTemplates') AND name = 'ShowNotes')
                        ALTER TABLE [QuoteTemplates] ADD [ShowNotes] bit NOT NULL DEFAULT 1 WITH VALUES;

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('QuoteTemplates') AND name = 'DefaultTerms')
                        ALTER TABLE [QuoteTemplates] ADD [DefaultTerms] nvarchar(max) NULL;

                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('QuoteTemplates') AND name = 'DefaultFooter')
                        ALTER TABLE [QuoteTemplates] ADD [DefaultFooter] nvarchar(max) NULL DEFAULT 'Thank you for your business!' WITH VALUES;
                END
            ");

            // 2. Quotes
            context.Database.ExecuteSqlRaw(@"
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Quotes' AND xtype='U')
                BEGIN
                    CREATE TABLE [Quotes] (
                        [Id] int NOT NULL IDENTITY,
                        [Subject] nvarchar(200) NOT NULL,
                        [QuoteNumber] nvarchar(50) NOT NULL,
                        [Status] nvarchar(20) NOT NULL,
                        [PublicToken] uniqueidentifier NOT NULL,
                        [ContactId] int NULL,
                        [CompanyId] int NULL,
                        [OpportunityId] int NULL,
                        [QuoteTemplateId] int NULL,
                        [QuoteDate] datetime2 NOT NULL,
                        [ExpirationDate] datetime2 NULL,
                        [SentDate] datetime2 NULL,
                        [ViewedDate] datetime2 NULL,
                        [AcceptedDate] datetime2 NULL,
                        [DeclinedDate] datetime2 NULL,
                        [Subtotal] decimal(18,2) NOT NULL,
                        [DiscountPercent] decimal(5,2) NOT NULL,
                        [DiscountAmount] decimal(18,2) NOT NULL,
                        [TaxAmount] decimal(18,2) NOT NULL,
                        [ShippingAmount] decimal(18,2) NOT NULL,
                        [Total] decimal(18,2) NOT NULL,
                        [Currency] nvarchar(3) NOT NULL,
                        [PaymentTerms] nvarchar(50) NOT NULL,
                        [TermsAndConditions] nvarchar(max) NULL,
                        [Notes] nvarchar(max) NULL,
                        [RecipientName] nvarchar(200) NULL,
                        [RecipientEmail] nvarchar(255) NULL,
                        [RecipientAddress] nvarchar(500) NULL,
                        [ViewCount] int NOT NULL DEFAULT 0,
                        [AcceptedByName] nvarchar(max) NULL,
                        [AcceptedByEmail] nvarchar(max) NULL,
                        [DeclineReason] nvarchar(max) NULL,
                        [Version] int NOT NULL DEFAULT 1,
                        [ParentQuoteId] int NULL,
                        [OwnerId] int NULL,
                        [CreatedAt] datetime2 NOT NULL,
                        [LastModifiedAt] datetime2 NOT NULL,
                        CONSTRAINT [PK_Quotes] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_Quotes_Contacts_ContactId] FOREIGN KEY ([ContactId]) REFERENCES [Contacts] ([Id]),
                        CONSTRAINT [FK_Quotes_Companies_CompanyId] FOREIGN KEY ([CompanyId]) REFERENCES [Companies] ([Id]),
                        CONSTRAINT [FK_Quotes_Opportunities_OpportunityId] FOREIGN KEY ([OpportunityId]) REFERENCES [Opportunities] ([Id])
                    );
                    CREATE INDEX [IX_Quotes_ContactId] ON [Quotes] ([ContactId]);
                    CREATE INDEX [IX_Quotes_CompanyId] ON [Quotes] ([CompanyId]);
                    CREATE INDEX [IX_Quotes_OpportunityId] ON [Quotes] ([OpportunityId]);
                END
            ");

            // 2.1 Ensure QuoteTemplateId column exists (for existing tables created before the column was added)
            context.Database.ExecuteSqlRaw(@"
                IF EXISTS (SELECT * FROM sysobjects WHERE name='Quotes' AND xtype='U')
                AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Quotes') AND name = 'QuoteTemplateId')
                BEGIN
                    ALTER TABLE [Quotes] ADD [QuoteTemplateId] int NULL;
                    PRINT 'Added QuoteTemplateId column to Quotes table.';
                END
            ");

            // 3. QuoteLineItems
            context.Database.ExecuteSqlRaw(@"
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='QuoteLineItems' AND xtype='U')
                BEGIN
                    CREATE TABLE [QuoteLineItems] (
                        [Id] int NOT NULL IDENTITY,
                        [QuoteId] int NOT NULL,
                        [ProductId] int NULL,
                        [Name] nvarchar(200) NOT NULL,
                        [SKU] nvarchar(50) NULL,
                        [Description] nvarchar(max) NULL,
                        [Quantity] decimal(18,4) NOT NULL,
                        [UnitOfMeasure] nvarchar(20) NOT NULL,
                        [UnitPrice] decimal(18,2) NOT NULL,
                        [Cost] decimal(18,2) NOT NULL,
                        [DiscountPercent] decimal(5,2) NOT NULL,
                        [DiscountAmount] decimal(18,2) NOT NULL,
                        [IsTaxable] bit NOT NULL,
                        [TaxRate] decimal(5,2) NOT NULL,
                        [TaxAmount] decimal(18,2) NOT NULL,
                        [LineTotal] decimal(18,2) NOT NULL,
                        [LineTotalWithTax] decimal(18,2) NOT NULL,
                        [SortOrder] int NOT NULL,
                        [GroupName] nvarchar(100) NULL,
                        [Notes] nvarchar(max) NULL,
                        [CreatedAt] datetime2 NOT NULL,
                        [LastModifiedAt] datetime2 NOT NULL,
                        CONSTRAINT [PK_QuoteLineItems] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_QuoteLineItems_Quotes_QuoteId] FOREIGN KEY ([QuoteId]) REFERENCES [Quotes] ([Id]) ON DELETE CASCADE,
                        CONSTRAINT [FK_QuoteLineItems_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id])
                    );
                    CREATE INDEX [IX_QuoteLineItems_QuoteId] ON [QuoteLineItems] ([QuoteId]);
                END
            ");
            logger.LogInformation("Ensured Quotes tables exist.");
        } catch (Exception ex) {
            logger.LogError(ex, "Failed to manually create Quotes tables.");
        }

        // WEBHOOKS TABLES (External Integrations)
        try {
            // 1. Webhooks
            context.Database.ExecuteSqlRaw(@"
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Webhooks' AND xtype='U')
                BEGIN
                    CREATE TABLE [Webhooks] (
                        [Id] int NOT NULL IDENTITY,
                        [Name] nvarchar(200) NOT NULL,
                        [Url] nvarchar(max) NOT NULL,
                        [Events] nvarchar(max) NOT NULL,
                        [Secret] nvarchar(max) NOT NULL,
                        [IsActive] bit NOT NULL DEFAULT 1,
                        [Description] nvarchar(max) NULL,
                        [TriggerCount] int NOT NULL DEFAULT 0,
                        [LastTriggeredAt] datetime2 NULL,
                        [LastError] nvarchar(max) NULL,
                        [FailureCount] int NOT NULL DEFAULT 0,
                        [CustomHeaders] nvarchar(max) NULL,
                        [CreatedAt] datetime2 NOT NULL,
                        [UpdatedAt] datetime2 NULL,
                        CONSTRAINT [PK_Webhooks] PRIMARY KEY ([Id])
                    );
                END
            ");

            // 2. WebhookLogs
            context.Database.ExecuteSqlRaw(@"
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='WebhookLogs' AND xtype='U')
                BEGIN
                    CREATE TABLE [WebhookLogs] (
                        [Id] int NOT NULL IDENTITY,
                        [WebhookId] int NOT NULL,
                        [EventType] nvarchar(100) NOT NULL,
                        [Payload] nvarchar(max) NOT NULL,
                        [StatusCode] int NOT NULL,
                        [Response] nvarchar(max) NULL,
                        [Success] bit NOT NULL,
                        [ErrorMessage] nvarchar(max) NULL,
                        [AttemptNumber] int NOT NULL DEFAULT 1,
                        [CreatedAt] datetime2 NOT NULL,
                        CONSTRAINT [PK_WebhookLogs] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_WebhookLogs_Webhooks_WebhookId] FOREIGN KEY ([WebhookId]) REFERENCES [Webhooks] ([Id]) ON DELETE CASCADE
                    );
                    CREATE INDEX [IX_WebhookLogs_WebhookId] ON [WebhookLogs] ([WebhookId]);
                END
            ");
            logger.LogInformation("Ensured Webhooks tables exist.");
        } catch (Exception ex) {
            logger.LogError(ex, "Failed to manually create Webhooks tables.");
        }

        DbInitializer.Initialize(context);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred creating the tenant DB.");
    }

    // Initialize master database (optional for multi-tenant)
    try
    {
        var masterContext = services.GetRequiredService<MasterDbContext>();
        masterContext.Database.Migrate();
    }
    catch (Exception ex)
    {
        logger.LogWarning(ex, "Master DB migration failed - this is optional for single-tenant mode.");
    }
}

app.Run();
