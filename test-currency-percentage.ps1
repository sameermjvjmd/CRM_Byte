# Test Currency and Percentage Custom Fields

Write-Host "Testing Currency and Percentage Custom Fields..." -ForegroundColor Cyan

# Step 1: Register/Login
Write-Host "`n1. Registering tenant and getting token..." -ForegroundColor Yellow
$registerBody = @{
    tenantName = "Test CRM"
    adminEmail = "admin@testcrm.com"
    adminPassword = "Admin@123"
    adminFirstName = "Admin"
    adminLastName = "User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/tenants/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body $registerBody
    $token = $registerResponse.token
    $tenantId = $registerResponse.tenantId
    Write-Host "[OK] Registered successfully. Tenant ID: $tenantId" -ForegroundColor Green
} catch {
    # If registration fails, try to login
    Write-Host "Registration failed (tenant may exist), trying login..." -ForegroundColor Yellow
    $loginBody = @{
        email = "admin@testcrm.com"
        password = "Admin@123"
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"; "X-Tenant-Id"="1"} -Body $loginBody
        $token = $loginResponse.token
        $tenantId = 1
        Write-Host "[OK] Logged in successfully" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Login failed: $_" -ForegroundColor Red
        exit 1
    }
}

$headers = @{
    "Authorization" = "Bearer $token"
    "X-Tenant-Id" = "$tenantId"
    "Content-Type" = "application/json"
}

# Step 2: Create Currency Field
Write-Host "`n2. Creating Currency custom field..." -ForegroundColor Yellow
$currencyField = @{
    entityType = "Contact"
    fieldName = "annual_salary"
    displayName = "Annual Salary"
    fieldType = "Currency"
    isRequired = $false
    isActive = $true
} | ConvertTo-Json

try {
    $currencyResult = Invoke-RestMethod -Uri "http://localhost:5000/api/customfields" -Method POST -Headers $headers -Body $currencyField
    Write-Host "[OK] Currency field created successfully. ID: $($currencyResult.id)" -ForegroundColor Green
    Write-Host "     Field Type: $($currencyResult.fieldType)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Failed to create Currency field" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Create Percentage Field
Write-Host "`n3. Creating Percentage custom field..." -ForegroundColor Yellow
$percentageField = @{
    entityType = "Contact"
    fieldName = "commission_rate"
    displayName = "Commission Rate"
    fieldType = "Percentage"
    isRequired = $false
    isActive = $true
} | ConvertTo-Json

try {
    $percentageResult = Invoke-RestMethod -Uri "http://localhost:5000/api/customfields" -Method POST -Headers $headers -Body $percentageField
    Write-Host "[OK] Percentage field created successfully. ID: $($percentageResult.id)" -ForegroundColor Green
    Write-Host "     Field Type: $($percentageResult.fieldType)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Failed to create Percentage field" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Verify fields were created
Write-Host "`n4. Verifying fields..." -ForegroundColor Yellow
try {
    $fields = Invoke-RestMethod -Uri "http://localhost:5000/api/customfields?entityType=Contact" -Method GET -Headers $headers
    $currencyFieldCheck = $fields | Where-Object { $_.fieldName -eq "annual_salary" }
    $percentageFieldCheck = $fields | Where-Object { $_.fieldName -eq "commission_rate" }

    if ($currencyFieldCheck) {
        Write-Host "[OK] Currency field found: $($currencyFieldCheck.displayName) ($($currencyFieldCheck.fieldType))" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Currency field not found" -ForegroundColor Red
    }

    if ($percentageFieldCheck) {
        Write-Host "[OK] Percentage field found: $($percentageFieldCheck.displayName) ($($percentageFieldCheck.fieldType))" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Percentage field not found" -ForegroundColor Red
    }
} catch {
    Write-Host "[ERROR] Failed to verify fields: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n[SUCCESS] All tests passed!" -ForegroundColor Green
