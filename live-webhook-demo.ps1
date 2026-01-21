# Live Webhook Demo Script
# This script creates a webhook and triggers a real event

$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJhZG1pbkBkZW1vLmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJEZW1vIEFkbWluIiwidXNlcklkIjoiMSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkFkbWluIiwicGVybWlzc2lvbiI6WyJhY3Rpdml0aWVzLmNyZWF0ZSIsImFjdGl2aXRpZXMuZGVsZXRlIiwiYWN0aXZpdGllcy5lZGl0IiwiYWN0aXZpdGllcy52aWV3IiwiYWRtaW4ucm9sZXMiLCJhZG1pbi5zZXR0aW5ncyIsImFkbWluLnVzZXJzIiwiY29tcGFuaWVzLmNyZWF0ZSIsImNvbXBhbmllcy5kZWxldGUiLCJjb21wYW5pZXMuZWRpdCIsImNvbXBhbmllcy52aWV3IiwiY29udGFjdHMuY3JlYXRlIiwiY29udGFjdHMuZGVsZXRlIiwiY29udGFjdHMuZWRpdCIsImNvbnRhY3RzLmV4cG9ydCIsImNvbnRhY3RzLmltcG9ydCIsImNvbnRhY3RzLnZpZXciLCJtYXJrZXRpbmcuY3JlYXRlIiwibWFya2V0aW5nLnNlbmQiLCJtYXJrZXRpbmcudmlldyIsIm9wcG9ydHVuaXRpZXMuY3JlYXRlIiwib3Bwb3J0dW5pdGllcy5kZWxldGUiLCJvcHBvcnR1bml0aWVzLmVkaXQiLCJvcHBvcnR1bml0aWVzLnBpcGVsaW5lIiwib3Bwb3J0dW5pdGllcy52aWV3IiwicmVwb3J0cy5jcmVhdGUiLCJyZXBvcnRzLmV4cG9ydCIsInJlcG9ydHMudmlldyJdLCJleHAiOjE3Njg5NDM1MjYsImlzcyI6Ik5leHVzQ1JNIiwiYXVkIjoiTmV4dXNDUk0tVXNlcnMifQ.dDRrglYZlial25aMEhJRwu1CNMZQ01vy4LGSx2HLfi0"
$baseUrl = "http://localhost:5000"
$beeceptorUrl = "https://crm-test-12345.free.beeceptor.com"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LIVE WEBHOOK DEMO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create webhook
Write-Host "[Step 1] Creating webhook with Beeceptor..." -ForegroundColor Yellow
$webhookData = @{
    name = "Beeceptor - Live Demo"
    url = $beeceptorUrl
    events = "contact.created,opportunity.won,email.sent"
    description = "Live webhook demonstration"
    isActive = $true
} | ConvertTo-Json

try {
    $webhook = Invoke-RestMethod -Uri "$baseUrl/api/webhooks" -Method Post -Headers $headers -Body $webhookData -ErrorAction Stop
    Write-Host "✅ Webhook created successfully!" -ForegroundColor Green
    Write-Host "   ID: $($webhook.id)" -ForegroundColor Gray
    Write-Host "   URL: $($webhook.url)" -ForegroundColor Gray
    Write-Host "   Events: $($webhook.events)" -ForegroundColor Gray
    $webhookId = $webhook.id
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Test webhook
Write-Host "[Step 2] Sending test event..." -ForegroundColor Yellow
try {
    $testResult = Invoke-RestMethod -Uri "$baseUrl/api/webhooks/$webhookId/test" -Method Post -Headers $headers -ErrorAction Stop
    Write-Host "✅ Test event sent!" -ForegroundColor Green
    Write-Host "   Check Beeceptor console: https://app.beeceptor.com/console/crm-test-12345" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Waiting 3 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Step 3: Create a real contact to trigger webhook
Write-Host "[Step 3] Creating a new contact to trigger webhook..." -ForegroundColor Yellow
$contactData = @{
    firstName = "Webhook"
    lastName = "Demo"
    email = "webhook.demo@example.com"
    phone = "+1-555-0123"
    companyId = 1
    jobTitle = "Test Contact"
    status = "Active"
    leadSource = "Webhook Demo"
} | ConvertTo-Json

try {
    $contact = Invoke-RestMethod -Uri "$baseUrl/api/contacts" -Method Post -Headers $headers -Body $contactData -ErrorAction Stop
    Write-Host "✅ Contact created!" -ForegroundColor Green
    Write-Host "   ID: $($contact.id)" -ForegroundColor Gray
    Write-Host "   Name: $($contact.firstName) $($contact.lastName)" -ForegroundColor Gray
    Write-Host "   Email: $($contact.email)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   🔔 Webhook 'contact.created' event triggered!" -ForegroundColor Cyan
    Write-Host "   Check Beeceptor console to see the payload!" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Waiting 3 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Step 4: View webhook logs
Write-Host "[Step 4] Viewing webhook delivery logs..." -ForegroundColor Yellow
try {
    $logs = Invoke-RestMethod -Uri "$baseUrl/api/webhooks/$webhookId/logs?limit=5" -Headers $headers -ErrorAction Stop
    Write-Host "✅ Found $($logs.Count) log entries:" -ForegroundColor Green
    $logs | ForEach-Object {
        $status = if ($_.success) { "✅" } else { "❌" }
        Write-Host "   $status Event: $($_.eventType) | Status: $($_.statusCode) | Time: $($_.createdAt)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEMO COMPLETE!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  ✅ Webhook created and configured" -ForegroundColor Green
Write-Host "  ✅ Test event sent" -ForegroundColor Green
Write-Host "  ✅ Real contact created" -ForegroundColor Green
Write-Host "  ✅ Webhook triggered automatically" -ForegroundColor Green
Write-Host "  ✅ Delivery logged" -ForegroundColor Green
Write-Host ""
Write-Host "View webhook payloads at:" -ForegroundColor Yellow
Write-Host "  https://app.beeceptor.com/console/crm-test-12345" -ForegroundColor Cyan
Write-Host ""
Write-Host "You should see 2 webhook deliveries:" -ForegroundColor Yellow
Write-Host "  1. webhook.test - Test event" -ForegroundColor Cyan
Write-Host "  2. contact.created - Real contact creation" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  • Set up Slack webhook for real notifications" -ForegroundColor Cyan
Write-Host "  • Create Zapier integration for automation" -ForegroundColor Cyan
Write-Host "  • Build custom webhook receiver" -ForegroundColor Cyan
Write-Host ""
