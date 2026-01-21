# Test Custom Fields API
# Test Custom Fields API
. .\generate_jwt.ps1
$token = New-JwtToken -SecretKey "YourSuperSecretKeyThatIsAtLeast32CharactersLong!@#$"
Write-Host "Using Generated Token..."
$baseUrl = "http://localhost:5000"
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }

Write-Host "--- 1. Create Custom Field ---" -ForegroundColor Cyan
$body = @{
    entityType = "Contact"
    fieldName = "FavoriteColor"
    displayName = "Favorite Color"
    fieldType = "Text"
    isRequired = $false
} | ConvertTo-Json

try {
    $field = Invoke-RestMethod -Uri "$baseUrl/api/customfields" -Method Post -Headers $headers -Body $body -ErrorAction Stop
    Write-Host "Created Field ID: $($field.id)" -ForegroundColor Green
    $fieldId = $field.id
} catch {
    Write-Host "Error creating field: $_" -ForegroundColor Red
    exit
}

Write-Host "`n--- 2. Get Custom Fields ---" -ForegroundColor Cyan
$fields = Invoke-RestMethod -Uri "$baseUrl/api/customfields/Contact" -Headers $headers
Write-Host "Found $($fields.Count) fields for Contact" -ForegroundColor Green
$fields | ForEach-Object { Write-Host " - $($_.displayName) ($($_.fieldType))" }

Write-Host "`n--- 3. Update Custom Field ---" -ForegroundColor Cyan
$updateBody = @{
    displayName = "Favorite Color (Updated)"
    isRequired = $true
    isActive = $true
    displayOrder = 1
} | ConvertTo-Json

try {
    $updated = Invoke-RestMethod -Uri "$baseUrl/api/customfields/$fieldId" -Method Put -Headers $headers -Body $updateBody
    Write-Host "Updated Name: $($updated.displayName)" -ForegroundColor Green
} catch {
    Write-Host "Error updating: $_" -ForegroundColor Red
}

Write-Host "`n--- 4. Set Value for Contact (ID 1) ---" -ForegroundColor Cyan
# Assuming Contact ID 1 exists
$valueBody = @{
    values = @{
        FavoriteColor = "Blue"
    }
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/api/customfields/Contact/1/values" -Method Post -Headers $headers -Body $valueBody
    Write-Host "Value set successfully" -ForegroundColor Green
} catch {
    Write-Host "Error setting value (Contact 1 might not exist): $_" -ForegroundColor Yellow
}

Write-Host "`n--- 5. Get Values for Contact (ID 1) ---" -ForegroundColor Cyan
try {
    $values = Invoke-RestMethod -Uri "$baseUrl/api/customfields/Contact/1/values" -Headers $headers
    Write-Host "Values:" -ForegroundColor Green
    $values | ForEach-Object { Write-Host " - $($_.displayName): $($_.value)" }
} catch {
    Write-Host "Error getting values: $_" -ForegroundColor Red
}

Write-Host "`n--- 6. Delete Custom Field ---" -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "$baseUrl/api/customfields/$fieldId" -Method Delete -Headers $headers
    Write-Host "Deleted Field $fieldId" -ForegroundColor Green
} catch {
    Write-Host "Error deleting: $_" -ForegroundColor Red
}
