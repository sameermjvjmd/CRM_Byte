# CRM API - IIS Deployment Guide

## Prerequisites
1. **IIS** installed with ASP.NET Core Hosting Bundle
2. **.NET 10.0 Runtime** installed on the server
3. **SQL Server** accessible from the IIS server

## Step 1: Install ASP.NET Core Hosting Bundle (if not installed)
Download and install from: https://dotnet.microsoft.com/download/dotnet/10.0

## Step 2: Deploy to IIS

### Option A: Using PowerShell (Run as Administrator)
```powershell
# Create the IIS directory
New-Item -ItemType Directory -Path "C:\inetpub\wwwroot\CrmApi" -Force

# Copy published files
Copy-Item -Path "D:\Project(s)\CRM_ACT\CRM.Api\publish\*" -Destination "C:\inetpub\wwwroot\CrmApi" -Recurse -Force

# Create logs directory for stdout logging
New-Item -ItemType Directory -Path "C:\inetpub\wwwroot\CrmApi\logs" -Force
```

### Option B: Manual Copy
1. Navigate to `D:\Project(s)\CRM_ACT\CRM.Api\publish`
2. Copy all contents to `C:\inetpub\wwwroot\CrmApi`

## Step 3: Create IIS Site

### Using IIS Manager:
1. Open **IIS Manager** (inetmgr)
2. Right-click **Sites** → **Add Website**
3. Configure:
   - **Site name**: `CRM_API`
   - **Physical path**: `C:\inetpub\wwwroot\CrmApi`
   - **Binding**: 
     - Type: `http` or `https`
     - Port: `5000` (or your preferred port)
     - Host name: (optional, e.g., `api.yourcrm.com`)
4. Click **OK**

### Using PowerShell (Administrator):
```powershell
Import-Module WebAdministration

# Create Application Pool
New-WebAppPool -Name "CrmApiPool"
Set-ItemProperty "IIS:\AppPools\CrmApiPool" -Name "managedRuntimeVersion" -Value ""

# Create Website
New-Website -Name "CRM_API" -PhysicalPath "C:\inetpub\wwwroot\CrmApi" -Port 5000 -ApplicationPool "CrmApiPool"
```

## Step 4: Configure Application Pool
1. In IIS Manager, select **Application Pools**
2. Select **CrmApiPool** (or your pool)
3. Click **Basic Settings**
4. Set **.NET CLR version** to **No Managed Code**
5. Click **OK**

## Step 5: Set Folder Permissions
```powershell
# Grant IIS_IUSRS read/write access
$acl = Get-Acl "C:\inetpub\wwwroot\CrmApi"
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule("IIS_IUSRS", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($rule)
Set-Acl "C:\inetpub\wwwroot\CrmApi" $acl
```

## Step 6: Update Connection String (Production)
Edit `C:\inetpub\wwwroot\CrmApi\appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SQL_SERVER;Database=CRM_ACT_DB;User Id=YOUR_USER;Password=YOUR_PASSWORD;TrustServerCertificate=True;MultipleActiveResultSets=true"
  }
}
```

## Step 7: Enable CORS (if needed)
The API should already have CORS configured. If accessing from a different domain, ensure your frontend URL is allowed.

## Step 8: Test the Deployment
Open a browser and navigate to:
- `http://localhost:5000/api/products/categories`

You should see: `["Software","Hardware","Service","Subscription","License","Support","Training","Consulting"]`

## Troubleshooting

### View Logs
```powershell
# Enable stdout logging in web.config
# Change: stdoutLogEnabled="false" to stdoutLogEnabled="true"
# Logs will be in: C:\inetpub\wwwroot\CrmApi\logs\
```

### Common Issues
1. **500.19 Error**: Check web.config syntax
2. **502.5 Error**: .NET Runtime not installed or version mismatch
3. **Database Connection Failed**: Check connection string and SQL Server accessibility

## Quick Deploy Script
Save as `deploy-api.ps1` and run as Administrator:
```powershell
$source = "D:\Project(s)\CRM_ACT\CRM.Api\publish"
$dest = "C:\inetpub\wwwroot\CrmApi"

# Stop the site if exists
Stop-Website -Name "CRM_API" -ErrorAction SilentlyContinue

# Copy files
if (!(Test-Path $dest)) { New-Item -ItemType Directory -Path $dest -Force }
Copy-Item -Path "$source\*" -Destination $dest -Recurse -Force
New-Item -ItemType Directory -Path "$dest\logs" -Force -ErrorAction SilentlyContinue

# Set permissions
icacls $dest /grant "IIS_IUSRS:(OI)(CI)F" /T

# Start the site
Start-Website -Name "CRM_API" -ErrorAction SilentlyContinue

Write-Host "Deployment complete!" -ForegroundColor Green
```
