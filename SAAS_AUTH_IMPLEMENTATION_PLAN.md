# 🔐 SaaS Multi-Tenant Authentication Implementation Plan

## Architecture Overview

**Selected Options:**
- ✅ Subdomain per tenant (`company1.nexuscrm.com`, `company2.nexuscrm.com`)
- ✅ Separate database per tenant (Complete data isolation)
- ✅ Self-service + Admin management (Both registration flows)
- ✅ Custom roles per tenant (Each company defines roles)
- ✅ Feature-based permissions (Granular permissions per user)

---

## 🏗️ Database Architecture

### Master Database (`NexusCRM_Master`)
Stores tenant information and super admin users:

```sql
-- Tenant Registry
CREATE TABLE Tenants (
    Id INT PRIMARY KEY,
    Subdomain NVARCHAR(100) UNIQUE,    -- e.g., "bytesymphony"
    CompanyName NVARCHAR(200),
    DatabaseName NVARCHAR(100),         -- e.g., "NexusCRM_ByteSymphony"
    ConnectionString NVARCHAR(500),
    Status NVARCHAR(50),                -- Active, Suspended, Trial, Cancelled
    Plan NVARCHAR(50),                  -- Free, Pro, Enterprise
    CreatedAt DATETIME,
    TrialEndsAt DATETIME,
    SubscriptionEndsAt DATETIME,
    MaxUsers INT,
    Settings NVARCHAR(MAX)              -- JSON for tenant-specific settings
);

-- Super Admins (Platform administrators)
CREATE TABLE SuperAdmins (
    Id INT PRIMARY KEY,
    Email NVARCHAR(200) UNIQUE,
    PasswordHash NVARCHAR(200),
    FullName NVARCHAR(200),
    IsActive BIT,
    CreatedAt DATETIME
);

-- Tenant Invitations (for self-service signup)
CREATE TABLE TenantInvitations (
    Id INT PRIMARY KEY,
    Email NVARCHAR(200),
    TenantId INT,
    Token NVARCHAR(200),
    ExpiresAt DATETIME,
    Used BIT
);
```

### Per-Tenant Database (`NexusCRM_{TenantName}`)
Each tenant gets a copy of the CRM schema:

```sql
-- Users (per tenant)
CREATE TABLE Users (
    Id INT PRIMARY KEY,
    Email NVARCHAR(200) UNIQUE,
    PasswordHash NVARCHAR(200),
    FullName NVARCHAR(200),
    IsActive BIT,
    EmailVerified BIT,
    AvatarUrl NVARCHAR(500),
    LastLoginAt DATETIME,
    CreatedAt DATETIME,
    CreatedBy INT
);

-- Custom Roles (per tenant)
CREATE TABLE Roles (
    Id INT PRIMARY KEY,
    Name NVARCHAR(100),
    Description NVARCHAR(500),
    IsSystemRole BIT,                   -- Admin, Manager, User (default)
    CreatedAt DATETIME
);

-- Permissions (feature-based)
CREATE TABLE Permissions (
    Id INT PRIMARY KEY,
    Code NVARCHAR(100) UNIQUE,          -- e.g., "contacts.view", "contacts.edit"
    Name NVARCHAR(100),
    Category NVARCHAR(100),             -- Contacts, Opportunities, Reports, etc.
    Description NVARCHAR(500)
);

-- Role-Permission mapping
CREATE TABLE RolePermissions (
    RoleId INT,
    PermissionId INT,
    PRIMARY KEY (RoleId, PermissionId)
);

-- User-Role mapping
CREATE TABLE UserRoles (
    UserId INT,
    RoleId INT,
    PRIMARY KEY (UserId, RoleId)
);

-- Refresh Tokens
CREATE TABLE RefreshTokens (
    Id INT PRIMARY KEY,
    UserId INT,
    Token NVARCHAR(200),
    ExpiresAt DATETIME,
    CreatedAt DATETIME,
    RevokedAt DATETIME
);

-- Audit Log
CREATE TABLE AuditLogs (
    Id INT PRIMARY KEY,
    UserId INT,
    Action NVARCHAR(100),
    EntityType NVARCHAR(100),
    EntityId INT,
    OldValues NVARCHAR(MAX),
    NewValues NVARCHAR(MAX),
    IpAddress NVARCHAR(50),
    Timestamp DATETIME
);

-- All existing CRM tables (Contacts, Companies, etc.)
```

---

## 📁 Backend Project Structure

```
CRM.Api/
├── Data/
│   ├── MasterDbContext.cs           # For tenant management
│   ├── TenantDbContext.cs           # Dynamic per-tenant context
│   └── TenantDatabaseManager.cs     # Creates/manages tenant databases
├── Models/
│   ├── Auth/
│   │   ├── User.cs
│   │   ├── Role.cs
│   │   ├── Permission.cs
│   │   ├── RolePermission.cs
│   │   ├── UserRole.cs
│   │   └── RefreshToken.cs
│   ├── Tenant/
│   │   ├── Tenant.cs
│   │   ├── SuperAdmin.cs
│   │   └── TenantInvitation.cs
│   └── ... (existing models)
├── Controllers/
│   ├── AuthController.cs            # Login, Register, Refresh
│   ├── TenantController.cs          # Tenant management (super admin)
│   ├── RolesController.cs           # Role/permission management
│   ├── UsersController.cs           # User management (updated)
│   └── ... (existing controllers)
├── Services/
│   ├── IAuthService.cs
│   ├── AuthService.cs
│   ├── ITenantService.cs
│   ├── TenantService.cs
│   ├── IJwtService.cs
│   ├── JwtService.cs
│   ├── IPasswordHasher.cs
│   └── PasswordHasher.cs
├── Middleware/
│   ├── TenantMiddleware.cs          # Detects subdomain, sets tenant context
│   └── JwtMiddleware.cs             # Validates JWT tokens
├── DTOs/
│   ├── Auth/
│   │   ├── LoginRequest.cs
│   │   ├── LoginResponse.cs
│   │   ├── RegisterRequest.cs
│   │   ├── RefreshTokenRequest.cs
│   │   └── ChangePasswordRequest.cs
│   └── Tenant/
│       ├── CreateTenantRequest.cs
│       └── TenantResponse.cs
└── appsettings.json                 # Updated with JWT settings
```

---

## 🔧 Implementation Phases

### Phase 1: Master Database & Models (1-2 hours)
- [ ] Create Tenant, SuperAdmin models
- [ ] Create MasterDbContext
- [ ] Migration for master database
- [ ] Seed default super admin

### Phase 2: Per-Tenant Auth Models (1-2 hours)
- [ ] Create User, Role, Permission models
- [ ] Create RolePermission, UserRole models
- [ ] Create RefreshToken model
- [ ] Add to TenantDbContext (update ApplicationDbContext)
- [ ] Seed default roles and permissions

### Phase 3: Tenant Middleware (1-2 hours)
- [ ] Create TenantMiddleware
- [ ] Parse subdomain from request
- [ ] Lookup tenant in master DB
- [ ] Set tenant context (HttpContext.Items)
- [ ] Dynamic connection string per request

### Phase 4: Authentication Service (2-3 hours)
- [ ] Create PasswordHasher (BCrypt)
- [ ] Create JwtService (generate/validate tokens)
- [ ] Create AuthService (login, register, refresh)
- [ ] Configure JWT in Program.cs

### Phase 5: Auth Controller (1-2 hours)
- [ ] POST /api/auth/login
- [ ] POST /api/auth/register
- [ ] POST /api/auth/refresh
- [ ] POST /api/auth/logout
- [ ] POST /api/auth/forgot-password
- [ ] POST /api/auth/reset-password

### Phase 6: Tenant Controller (1-2 hours)
- [ ] GET /api/tenants (super admin only)
- [ ] POST /api/tenants (create new tenant)
- [ ] PUT /api/tenants/{id} (update tenant)
- [ ] DELETE /api/tenants/{id} (deactivate)
- [ ] POST /api/tenants/self-register (public)

### Phase 7: Role/Permission Controller (1-2 hours)
- [ ] GET /api/roles
- [ ] POST /api/roles
- [ ] PUT /api/roles/{id}
- [ ] DELETE /api/roles/{id}
- [ ] GET /api/permissions
- [ ] PUT /api/roles/{id}/permissions

### Phase 8: Protect Existing Controllers (1 hour)
- [ ] Add [Authorize] attributes
- [ ] Add permission checks
- [ ] Handle unauthorized responses

---

## 🎨 Frontend Implementation

### Phase 9: Auth Context & Hooks (1-2 hours)
- [ ] Create AuthContext
- [ ] Create useAuth hook
- [ ] Store JWT in localStorage
- [ ] Auto-refresh token
- [ ] Logout functionality

### Phase 10: Login Page (1 hour)
- [ ] Connect to real API
- [ ] Handle errors
- [ ] Redirect after login
- [ ] Remember me option

### Phase 11: Registration Flow (1-2 hours)
- [ ] Tenant registration page
- [ ] User registration page (with invite)
- [ ] Email verification flow (placeholder)

### Phase 12: Protected Routes (1 hour)
- [ ] Create ProtectedRoute component
- [ ] Redirect to login if not authenticated
- [ ] Handle expired tokens

### Phase 13: Role Management Page (1-2 hours)
- [ ] List roles
- [ ] Create/edit role modal
- [ ] Permission assignment UI
- [ ] Delete role confirmation

### Phase 14: User Management Updates (1 hour)
- [ ] Real user CRUD
- [ ] Role assignment
- [ ] Invite user flow
- [ ] Deactivate user

---

## 🔐 Default Permissions (Feature-Based)

```typescript
const PERMISSIONS = {
  // Contacts
  'contacts.view': 'View Contacts',
  'contacts.create': 'Create Contacts',
  'contacts.edit': 'Edit Contacts',
  'contacts.delete': 'Delete Contacts',
  'contacts.export': 'Export Contacts',
  'contacts.import': 'Import Contacts',
  
  // Companies
  'companies.view': 'View Companies',
  'companies.create': 'Create Companies',
  'companies.edit': 'Edit Companies',
  'companies.delete': 'Delete Companies',
  
  // Opportunities
  'opportunities.view': 'View Opportunities',
  'opportunities.create': 'Create Opportunities',
  'opportunities.edit': 'Edit Opportunities',
  'opportunities.delete': 'Delete Opportunities',
  'opportunities.pipeline': 'Access Pipeline View',
  
  // Activities
  'activities.view': 'View Activities',
  'activities.create': 'Create Activities',
  'activities.edit': 'Edit Activities',
  'activities.delete': 'Delete Activities',
  
  // Reports
  'reports.view': 'View Reports',
  'reports.create': 'Create Custom Reports',
  'reports.export': 'Export Reports',
  
  // Marketing
  'marketing.view': 'View Campaigns',
  'marketing.create': 'Create Campaigns',
  'marketing.send': 'Send Marketing Emails',
  
  // Admin
  'admin.users': 'Manage Users',
  'admin.roles': 'Manage Roles',
  'admin.settings': 'Manage Settings',
  'admin.billing': 'Manage Billing',
};
```

---

## 🌐 URL Flow

**Self-Service Registration:**
1. User visits `app.nexuscrm.com/register`
2. Creates company (tenant) account
3. Chooses subdomain (e.g., "bytesymphony")
4. System creates database `NexusCRM_ByteSymphony`
5. Redirects to `bytesymphony.nexuscrm.com/login`
6. User logs in

**Admin Creates Tenant:**
1. Super admin logs into `admin.nexuscrm.com`
2. Creates new tenant
3. System creates database
4. Sends invite to tenant admin email

**User Login:**
1. User visits `bytesymphony.nexuscrm.com`
2. Middleware detects "bytesymphony" subdomain
3. Looks up tenant in master DB
4. Sets connection string for that tenant's DB
5. User logs in against that tenant's Users table

---

## 📦 NuGet Packages Needed

```xml
<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="10.0.0" />
<PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="8.0.0" />
```

---

## ⏱️ Estimated Time

| Phase | Estimated Time |
|-------|---------------|
| Backend (Phases 1-8) | 10-14 hours |
| Frontend (Phases 9-14) | 8-12 hours |
| **Total** | **18-26 hours** |

---

## 🚀 Ready to Start?

This is a significant undertaking. Should I:

1. **Start with Phase 1** - Master database & models
2. **Create a minimal auth first** - Just login/logout to unblock other work
3. **Discuss any changes** to the architecture

Let me know! 💪
