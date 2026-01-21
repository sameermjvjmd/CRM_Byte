# Test PDF and Excel Export
# This script tests the new export endpoints

$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJhZG1pbkBkZW1vLmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJEZW1vIEFkbWluIiwidXNlcklkIjoiMSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkFkbWluIiwicGVybWlzc2lvbiI6WyJhY3Rpdml0aWVzLmNyZWF0ZSIsImFjdGl2aXRpZXMuZGVsZXRlIiwiYWN0aXZpdGllcy5lZGl0IiwiYWN0aXZpdGllcy52aWV3IiwiYWRtaW4ucm9sZXMiLCJhZG1pbi5zZXR0aW5ncyIsImFkbWluLnVzZXJzIiwiY29tcGFuaWVzLmNyZWF0ZSIsImNvbXBhbmllcy5kZWxldGUiLCJjb21wYW5pZXMuZWRpdCIsImNvbXBhbmllcy52aWV3IiwiY29udGFjdHMuY3JlYXRlIiwiY29udGFjdHMuZGVsZXRlIiwiY29udGFjdHMuZWRpdCIsImNvbnRhY3RzLmV4cG9ydCIsImNvbnRhY3RzLmltcG9ydCIsImNvbnRhY3RzLnZpZXciLCJtYXJrZXRpbmcuY3JlYXRlIiwibWFya2V0aW5nLnNlbmQiLCJtYXJrZXRpbmcudmlldyIsIm9wcG9ydHVuaXRpZXMuY3JlYXRlIiwib3Bwb3J0dW5pdGllcy5kZWxldGUiLCJvcHBvcnR1bml0aWVzLmVkaXQiLCJvcHBvcnR1bml0aWVzLnBpcGVsaW5lIiwib3Bwb3J0dW5pdGllcy52aWV3IiwicmVwb3J0cy5jcmVhdGUiLCJyZXBvcnRzLmV4cG9ydCIsInJlcG9ydHMudmlldyJdLCJleHAiOjE3Njg5NDM1MjYsImlzcyI6Ik5leHVzQ1JNIiwiYXVkIjoiTmV4dXNDUk0tVXNlcnMifQ.dDRrglYZlial25aMEhJRwu1CNMZQ01vy4LGSx2HLfi0"
$baseUrl = "http://localhost:5000"

$headers = @{
    "Authorization" = "Bearer $token"
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PDF & EXCEL EXPORT - TESTING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create exports folder
$exportsFolder = ".\exports"
if (-not (Test-Path $exportsFolder)) {
    New-Item -ItemType Directory -Path $exportsFolder | Out-Null
    Write-Host "Created exports folder: $exportsFolder" -ForegroundColor Gray
}

Write-Host ""

# Test 1: Export Contacts to PDF
Write-Host "[Test 1] Exporting contacts to PDF..." -ForegroundColor Yellow
try {
    $pdfPath = "$exportsFolder\contacts_report.pdf"
    Invoke-RestMethod -Uri "$baseUrl/api/reports/export/contacts/pdf" `
        -Headers $headers `
        -OutFile $pdfPath `
        -ErrorAction Stop
    
    $fileSize = (Get-Item $pdfPath).Length
    Write-Host "✅ SUCCESS: PDF exported ($fileSize bytes)" -ForegroundColor Green
    Write-Host "   Location: $pdfPath" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Export Contacts to Excel
Write-Host "[Test 2] Exporting contacts to Excel..." -ForegroundColor Yellow
try {
    $excelPath = "$exportsFolder\contacts_report.xlsx"
    Invoke-RestMethod -Uri "$baseUrl/api/reports/export/contacts/excel" `
        -Headers $headers `
        -OutFile $excelPath `
        -ErrorAction Stop
    
    $fileSize = (Get-Item $excelPath).Length
    Write-Host "✅ SUCCESS: Excel exported ($fileSize bytes)" -ForegroundColor Green
    Write-Host "   Location: $excelPath" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Export Companies to PDF
Write-Host "[Test 3] Exporting companies to PDF..." -ForegroundColor Yellow
try {
    $pdfPath = "$exportsFolder\companies_report.pdf"
    Invoke-RestMethod -Uri "$baseUrl/api/reports/export/companies/pdf" `
        -Headers $headers `
        -OutFile $pdfPath `
        -ErrorAction Stop
    
    $fileSize = (Get-Item $pdfPath).Length
    Write-Host "✅ SUCCESS: PDF exported ($fileSize bytes)" -ForegroundColor Green
    Write-Host "   Location: $pdfPath" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Export Companies to Excel
Write-Host "[Test 4] Exporting companies to Excel..." -ForegroundColor Yellow
try {
    $excelPath = "$exportsFolder\companies_report.xlsx"
    Invoke-RestMethod -Uri "$baseUrl/api/reports/export/companies/excel" `
        -Headers $headers `
        -OutFile $excelPath `
        -ErrorAction Stop
    
    $fileSize = (Get-Item $excelPath).Length
    Write-Host "✅ SUCCESS: Excel exported ($fileSize bytes)" -ForegroundColor Green
    Write-Host "   Location: $excelPath" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Export Opportunities to PDF
Write-Host "[Test 5] Exporting opportunities to PDF..." -ForegroundColor Yellow
try {
    $pdfPath = "$exportsFolder\opportunities_report.pdf"
    Invoke-RestMethod -Uri "$baseUrl/api/reports/export/opportunities/pdf" `
        -Headers $headers `
        -OutFile $pdfPath `
        -ErrorAction Stop
    
    $fileSize = (Get-Item $pdfPath).Length
    Write-Host "✅ SUCCESS: PDF exported ($fileSize bytes)" -ForegroundColor Green
    Write-Host "   Location: $pdfPath" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 6: Export Opportunities to Excel
Write-Host "[Test 6] Exporting opportunities to Excel..." -ForegroundColor Yellow
try {
    $excelPath = "$exportsFolder\opportunities_report.xlsx"
    Invoke-RestMethod -Uri "$baseUrl/api/reports/export/opportunities/excel" `
        -Headers $headers `
        -OutFile $excelPath `
        -ErrorAction Stop
    
    $fileSize = (Get-Item $excelPath).Length
    Write-Host "✅ SUCCESS: Excel exported ($fileSize bytes)" -ForegroundColor Green
    Write-Host "   Location: $excelPath" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 7: Export Activities to PDF
Write-Host "[Test 7] Exporting activities to PDF..." -ForegroundColor Yellow
try {
    $pdfPath = "$exportsFolder\activities_report.pdf"
    Invoke-RestMethod -Uri "$baseUrl/api/reports/export/activities/pdf" `
        -Headers $headers `
        -OutFile $pdfPath `
        -ErrorAction Stop
    
    $fileSize = (Get-Item $pdfPath).Length
    Write-Host "✅ SUCCESS: PDF exported ($fileSize bytes)" -ForegroundColor Green
    Write-Host "   Location: $pdfPath" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 8: Export Activities to Excel
Write-Host "[Test 8] Exporting activities to Excel..." -ForegroundColor Yellow
try {
    $excelPath = "$exportsFolder\activities_report.xlsx"
    Invoke-RestMethod -Uri "$baseUrl/api/reports/export/activities/excel" `
        -Headers $headers `
        -OutFile $excelPath `
        -ErrorAction Stop
    
    $fileSize = (Get-Item $excelPath).Length
    Write-Host "✅ SUCCESS: Excel exported ($fileSize bytes)" -ForegroundColor Green
    Write-Host "   Location: $excelPath" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTING COMPLETE!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# List all exported files
Write-Host "Exported files:" -ForegroundColor Yellow
Get-ChildItem $exportsFolder | ForEach-Object {
    $size = "{0:N2} KB" -f ($_.Length / 1KB)
    Write-Host "  • $($_.Name) - $size" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Open the PDF files to verify formatting" -ForegroundColor Cyan
Write-Host "  2. Open the Excel files in Microsoft Excel" -ForegroundColor Cyan
Write-Host "  3. Check for proper headers, data, and styling" -ForegroundColor Cyan
Write-Host ""
Write-Host "To open the exports folder:" -ForegroundColor Yellow
Write-Host "  explorer.exe $exportsFolder" -ForegroundColor Cyan
Write-Host ""
