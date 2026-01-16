# CRM API IIS Deployment Script
# Run this script as Administrator

param(
    [string]$SiteName = "CRM_API",
    [string]$Port = "5000",
    [string]$SourcePath = "D:\Project(s)\CRM_ACT\CRM.Api\publish",
    [string]$DestPath = "C:\inetpub\wwwroot\CrmApi"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CRM API - IIS Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

Write-Host "[1/6] Stopping existing site..." -ForegroundColor Yellow
try {
    Import-Module WebAdministration -ErrorAction SilentlyContinue
    Stop-Website -Name $SiteName -ErrorAction SilentlyContinue
    Stop-WebAppPool -Name "${SiteName}Pool" -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
} catch {
    Write-Host "  No existing site to stop" -ForegroundColor Gray
}

Write-Host "[2/6] Creating destination directory..." -ForegroundColor Yellow
if (!(Test-Path $DestPath)) {
    New-Item -ItemType Directory -Path $DestPath -Force | Out-Null
    Write-Host "  Created: $DestPath" -ForegroundColor Green
} else {
    Write-Host "  Directory exists, clearing old files..." -ForegroundColor Gray
    Remove-Item -Path "$DestPath\*" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "[3/6] Copying published files..." -ForegroundColor Yellow
Copy-Item -Path "$SourcePath\*" -Destination $DestPath -Recurse -Force
New-Item -ItemType Directory -Path "$DestPath\logs" -Force -ErrorAction SilentlyContinue | Out-Null
Write-Host "  Files copied successfully" -ForegroundColor Green

Write-Host "[4/6] Setting folder permissions..." -ForegroundColor Yellow
icacls $DestPath /grant "IIS_IUSRS:(OI)(CI)F" /T /Q
icacls $DestPath /grant "IUSR:(OI)(CI)F" /T /Q
Write-Host "  Permissions set" -ForegroundColor Green

Write-Host "[5/6] Configuring IIS..." -ForegroundColor Yellow
Import-Module WebAdministration

# Create App Pool if not exists
if (!(Test-Path "IIS:\AppPools\${SiteName}Pool")) {
    New-WebAppPool -Name "${SiteName}Pool" | Out-Null
    Set-ItemProperty "IIS:\AppPools\${SiteName}Pool" -Name "managedRuntimeVersion" -Value ""
    Write-Host "  Created Application Pool: ${SiteName}Pool" -ForegroundColor Green
}

# Create Website if not exists
if (!(Test-Path "IIS:\Sites\$SiteName")) {
    New-Website -Name $SiteName -PhysicalPath $DestPath -Port $Port -ApplicationPool "${SiteName}Pool" | Out-Null
    Write-Host "  Created Website: $SiteName on port $Port" -ForegroundColor Green
} else {
    Set-ItemProperty "IIS:\Sites\$SiteName" -Name "physicalPath" -Value $DestPath
    Write-Host "  Updated Website: $SiteName" -ForegroundColor Green
}

Write-Host "[6/6] Starting site..." -ForegroundColor Yellow
Start-WebAppPool -Name "${SiteName}Pool" -ErrorAction SilentlyContinue
Start-Website -Name $SiteName -ErrorAction SilentlyContinue
Write-Host "  Site started" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "API URL: http://localhost:$Port" -ForegroundColor White
Write-Host "Test:    http://localhost:$Port/api/products/categories" -ForegroundColor White
Write-Host ""
Write-Host "To view logs, check: $DestPath\logs\" -ForegroundColor Gray
