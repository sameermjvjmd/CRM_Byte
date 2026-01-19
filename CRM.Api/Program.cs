using Microsoft.EntityFrameworkCore;
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
builder.Services.AddHostedService<WorkflowBackgroundService>();

// Reporting Services
builder.Services.AddScoped<CRM.Api.Services.Reporting.IReportBuilderService, CRM.Api.Services.Reporting.ReportBuilderService>();

// Security Services
builder.Services.AddSingleton<IEncryptionService, EncryptionService>();

// Search Services
builder.Services.AddScoped<CRM.Api.Services.Search.ISearchService, CRM.Api.Services.Search.SearchService>();

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
    app.MapOpenApi();
}

app.UseCors("AllowAll");

// Tenant Resolution Middleware (before authentication)
app.UseTenantMiddleware();

// Authentication & Authorization middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Initialize Databases
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    
    // Initialize default tenant database (existing)
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
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
