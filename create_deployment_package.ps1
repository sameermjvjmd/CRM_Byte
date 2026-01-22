$ErrorActionPreference = "Stop"
$ProjectRoot = "d:\Project(s)\CRM_ACT"
$OutputRoot = "$ProjectRoot\CRM_Artifacts"
if (Test-Path $OutputRoot) { Remove-Item $OutputRoot -Recurse -Force }
New-Item "$OutputRoot\crm-api" -ItemType Directory -Force | Out-Null
New-Item "$OutputRoot\crm-web" -ItemType Directory -Force | Out-Null

Write-Host "Copying Frontend..."
Copy-Item "$ProjectRoot\CRM.Web\dist\*" "$OutputRoot\crm-web" -Recurse -Force
Copy-Item "$ProjectRoot\web_spa.config" "$OutputRoot\crm-web\web.config" -Force

Write-Host "Publishing Backend..."
dotnet publish "$ProjectRoot\CRM.Api\CRM.Api.csproj" -c Release -o "$OutputRoot\crm-api" /p:EnvironmentName=Production

New-Item "$OutputRoot\crm-api\logs" -ItemType Directory -Force | Out-Null

Write-Host "Copying Instructions..."
Copy-Item "$ProjectRoot\deployment_readme.txt" "$OutputRoot\README.txt" -Force

Write-Host "Zipping..."
$ZipPath = "$ProjectRoot\CRM_Deployment_Package.zip"
if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }
Compress-Archive -Path "$OutputRoot\*" -DestinationPath $ZipPath

Write-Host "DONE: $ZipPath"
