# Check for Administrator privileges
if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "You must run this script as Administrator to configure IIS."
    exit
}

# Configuration
$ProjectRoot = $PSScriptRoot
$ApiProject = "$ProjectRoot\CRM.Api"
$WebProject = "$ProjectRoot\CRM.Web"
$PublishRoot = "C:\inetpub\wwwroot"
$ApiPublishPath = "$PublishRoot\crm-api"
$WebPublishPath = "$PublishRoot\crm-web"

$ApiSiteName = "CRM-Api"
$ApiPort = 5000
$ApiPoolName = "CRM-Api-Pool"

$WebSiteName = "CRM-Web"
$WebPort = 80
$WebPoolName = "CRM-Web-Pool"

# Ensure Modules
Import-Module WebAdministration

Write-Host "🚀 Starting Deployment to IIS..." -ForegroundColor Cyan

# ---------------------------------------------------------
# 1. Stop Existing Sites/Pools to unlock files
# ---------------------------------------------------------
Write-Host "1. Stopping existing sites..."
if (Get-Website -Name $ApiSiteName) { Stop-Website -Name $ApiSiteName; Write-Host "   Stopped $ApiSiteName" }
if (Get-Website -Name $WebSiteName) { Stop-Website -Name $WebSiteName; Write-Host "   Stopped $WebSiteName" }

# Give a moment for processes to release locks
Start-Sleep -Seconds 2

if (Get-WebAppPool -Name $ApiPoolName) { Stop-WebAppPool -Name $ApiPoolName; Write-Host "   Stopped pool $ApiPoolName" }
if (Get-WebAppPool -Name $WebPoolName) { Stop-WebAppPool -Name $WebPoolName; Write-Host "   Stopped pool $WebPoolName" }

Start-Sleep -Seconds 2

# ---------------------------------------------------------
# 2. Build and Publish Backend API
# ---------------------------------------------------------
Write-Host "2. Building Backend API..." -ForegroundColor Green
Remove-Item -Path $ApiPublishPath -Recurse -Force -ErrorAction SilentlyContinue

# Publish command
dotnet publish "$ApiProject\CRM.Api.csproj" -c Release -o "$ApiPublishPath" /p:EnvironmentName=Production

if ($LASTEXITCODE -ne 0) {
    Write-Error "Backend build failed!"
    exit
}

# Ensure logs folder exists
New-Item -Path "$ApiPublishPath\logs" -ItemType Directory -Force | Out-Null

# ---------------------------------------------------------
# 3. Build and Publish Frontend Web
# ---------------------------------------------------------
Write-Host "3. Building Frontend Web..." -ForegroundColor Green
Remove-Item -Path $WebPublishPath -Recurse -Force -ErrorAction SilentlyContinue

# NPM Build
Push-Location $WebProject
try {
    # Install dependencies if needed (optional, assumes done)
    # npm install
    
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        throw "Frontend build failed!"
    }
    
    # Copy files
    New-Item -Path $WebPublishPath -ItemType Directory -Force | Out-Null
    Copy-Item -Path "dist\*" -Destination $WebPublishPath -Recurse -Force
}
finally {
    Pop-Location
}

# Create web.config for React SPA (URL Rewrite)
$webConfigContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
        <mimeMap fileExtension=".json" mimeType="application/json" />
        <mimeMap fileExtension=".webp" mimeType="image/webp" />
    </staticContent>
  </system.webServer>
</configuration>
"@
Set-Content -Path "$WebPublishPath\web.config" -Value $webConfigContent

# ---------------------------------------------------------
# 4. Configure IIS - App Pools
# ---------------------------------------------------------
Write-Host "4. Configuring App Pools..." -ForegroundColor Green

# API Pool (No Managed Code for .NET Core)
if (!(Get-WebAppPool -Name $ApiPoolName)) {
    New-WebAppPool -Name $ApiPoolName
    Write-Host "   Created $ApiPoolName"
}
Set-ItemProperty "IIS:\AppPools\$ApiPoolName" -Name "managedRuntimeVersion" -Value ""

# Web Pool (No Managed Code, static files mostly)
if (!(Get-WebAppPool -Name $WebPoolName)) {
    New-WebAppPool -Name $WebPoolName
    Write-Host "   Created $WebPoolName"
}
Set-ItemProperty "IIS:\AppPools\$WebPoolName" -Name "managedRuntimeVersion" -Value ""

# ---------------------------------------------------------
# 5. Configure IIS - Sites
# ---------------------------------------------------------
Write-Host "5. Configuring Sites..." -ForegroundColor Green

# API Site
if (Get-Website -Name $ApiSiteName) {
    Remove-Website -Name $ApiSiteName
}
New-Website -Name $ApiSiteName -Port $ApiPort -PhysicalPath $ApiPublishPath -ApplicationPool $ApiPoolName -Force
Write-Host "   Created Site $ApiSiteName on Port $ApiPort"

# Web Site
if (Get-Website -Name $WebSiteName) {
    Remove-Website -Name $WebSiteName
}
# Check if Port 80 is taken by Default Web Site, stop it if so
if (Get-Website -Name "Default Web Site") {
    Stop-Website -Name "Default Web Site"
    Write-Host "   Stopped Default Web Site to free Port 80"
}

New-Website -Name $WebSiteName -Port $WebPort -PhysicalPath $WebPublishPath -ApplicationPool $WebPoolName -Force
Write-Host "   Created Site $WebSiteName on Port $WebPort"

# ---------------------------------------------------------
# 6. Start Sites
# ---------------------------------------------------------
Write-Host "6. Starting Sites..." -ForegroundColor Green
Start-WebAppPool -Name $ApiPoolName
Start-Website -Name $ApiSiteName

Start-WebAppPool -Name $WebPoolName
Start-Website -Name $WebSiteName

Write-Host "✅ Deployment Complete!" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost"
Write-Host "Backend:  http://localhost:$ApiPort"
Write-Host "API Docs: http://localhost:$ApiPort/scalar/v1"
