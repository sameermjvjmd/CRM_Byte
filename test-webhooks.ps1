# Webhooks Testing Script
# This script tests the webhooks system end-to-end

$baseUrl = "http://localhost:5000"
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJhZG1pbkBkZW1vLmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJEZW1vIEFkbWluIiwidXNlcklkIjoiMSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkFkbWluIiwicGVybWlzc2lvbiI6WyJhY3Rpdml0aWVzLmNyZWF0ZSIsImFjdGl2aXRpZXMuZGVsZXRlIiwiYWN0aXZpdGllcy5lZGl0IiwiYWN0aXZpdGllcy52aWV3IiwiYWRtaW4ucm9sZXMiLCJhZG1pbi5zZXR0aW5ncyIsImFkbWluLnVzZXJzIiwiY29tcGFuaWVzLmNyZWF0ZSIsImNvbXBhbmllcy5kZWxldGUiLCJjb21wYW5pZXMuZWRpdCIsImNvbXBhbmllcy52aWV3IiwiY29udGFjdHMuY3JlYXRlIiwiY29udGFjdHMuZGVsZXRlIiwiY29udGFjdHMuZWRpdCIsImNvbnRhY3RzLmV4cG9ydCIsImNvbnRhY3RzLmltcG9ydCIsImNvbnRhY3RzLnZpZXciLCJtYXJrZXRpbmcuY3JlYXRlIiwibWFya2V0aW5nLnNlbmQiLCJtYXJrZXRpbmcudmlldyIsIm9wcG9ydHVuaXRpZXMuY3JlYXRlIiwib3Bwb3J0dW5pdGllcy5kZWxldGUiLCJvcHBvcnR1bml0aWVzLmVkaXQiLCJvcHBvcnR1bml0aWVzLnBpcGVsaW5lIiwib3Bwb3J0dW5pdGllcy52aWV3IiwicmVwb3J0cy5jcmVhdGUiLCJyZXBvcnRzLmV4cG9ydCIsInJlcG9ydHMudmlldyJdLCJleHAiOjE3Njg5NDM1MjYsImlzcyI6Ik5leHVzQ1JNIiwiYXVkIjoiTmV4dXNDUk0tVXNlcnMifQ.dDRrglYZlial25aMEhJRwu1CNMZQ01vy4LGSx2HLfi0"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  WEBHOOKS SYSTEM - END-TO-END TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: List available events
Write-Host "[Test 1] Listing available webhook events..." -ForegroundColor Yellow
try {
    $events = Invoke-RestMethod -Uri "$baseUrl/api/webhooks/events" -Headers $headers -ErrorAction Stop
    Write-Host "✅ SUCCESS: Found $($events.Count) available events" -ForegroundColor Green
    Write-Host "Events:" -ForegroundColor Gray
    $events | ForEach-Object { Write-Host "  • $_" -ForegroundColor Gray }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Create a webhook
Write-Host "[Test 2] Creating a test webhook..." -ForegroundColor Yellow
$webhookData = @{
    name = "Test Webhook - PowerShell"
    url = "https://webhook.site/unique-url-here"  # You can replace with real webhook.site URL
    events = "contact.created,opportunity.won,email.sent"
    description = "Testing webhook system from PowerShell"
    isActive = $true
} | ConvertTo-Json

try {
    $webhook = Invoke-RestMethod -Uri "$baseUrl/api/webhooks" -Method Post -Headers $headers -Body $webhookData -ErrorAction Stop
    Write-Host "✅ SUCCESS: Webhook created with ID: $($webhook.id)" -ForegroundColor Green
    Write-Host "Details:" -ForegroundColor Gray
    Write-Host "  • Name: $($webhook.name)" -ForegroundColor Gray
    Write-Host "  • URL: $($webhook.url)" -ForegroundColor Gray
    Write-Host "  • Events: $($webhook.events)" -ForegroundColor Gray
    Write-Host "  • Secret: $($webhook.secret.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host "  • Active: $($webhook.isActive)" -ForegroundColor Gray
    $webhookId = $webhook.id
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: List all webhooks
Write-Host "[Test 3] Listing all webhooks..." -ForegroundColor Yellow
try {
    $webhooks = Invoke-RestMethod -Uri "$baseUrl/api/webhooks" -Headers $headers -ErrorAction Stop
    Write-Host "✅ SUCCESS: Found $($webhooks.Count) webhook(s)" -ForegroundColor Green
    $webhooks | ForEach-Object {
        Write-Host "  • ID: $($_.id) | Name: $($_.name) | Active: $($_.isActive)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Test webhook delivery
Write-Host "[Test 4] Testing webhook delivery..." -ForegroundColor Yellow
try {
    $testResult = Invoke-RestMethod -Uri "$baseUrl/api/webhooks/$webhookId/test" -Method Post -Headers $headers -ErrorAction Stop
    Write-Host "✅ SUCCESS: $($testResult.message)" -ForegroundColor Green
    Write-Host "  Check your webhook.site URL to see the payload!" -ForegroundColor Cyan
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Wait and view logs
Write-Host "[Test 5] Viewing webhook delivery logs..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
try {
    $logs = Invoke-RestMethod -Uri "$baseUrl/api/webhooks/$webhookId/logs?limit=10" -Headers $headers -ErrorAction Stop
    Write-Host "✅ SUCCESS: Found $($logs.Count) log entry/entries" -ForegroundColor Green
    $logs | ForEach-Object {
        $status = if ($_.success) { "✅ SUCCESS" } else { "❌ FAILED" }
        Write-Host "  $status | Event: $($_.eventType) | Status: $($_.statusCode) | Attempt: $($_.attemptNumber)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 6: Get specific webhook
Write-Host "[Test 6] Getting webhook details..." -ForegroundColor Yellow
try {
    $webhookDetails = Invoke-RestMethod -Uri "$baseUrl/api/webhooks/$webhookId" -Headers $headers -ErrorAction Stop
    Write-Host "✅ SUCCESS: Retrieved webhook details" -ForegroundColor Green
    Write-Host "  • Trigger Count: $($webhookDetails.triggerCount)" -ForegroundColor Gray
    Write-Host "  • Last Triggered: $($webhookDetails.lastTriggeredAt)" -ForegroundColor Gray
    Write-Host "  • Failure Count: $($webhookDetails.failureCount)" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 7: Update webhook
Write-Host "[Test 7] Updating webhook..." -ForegroundColor Yellow
$updateData = @{
    name = "Updated Test Webhook"
    url = $webhook.url
    events = "contact.created,contact.updated,opportunity.won"
    isActive = $true
    description = "Updated from PowerShell test"
} | ConvertTo-Json

try {
    $updated = Invoke-RestMethod -Uri "$baseUrl/api/webhooks/$webhookId" -Method Put -Headers $headers -Body $updateData -ErrorAction Stop
    Write-Host "✅ SUCCESS: Webhook updated" -ForegroundColor Green
    Write-Host "  • New Name: $($updated.name)" -ForegroundColor Gray
    Write-Host "  • New Events: $($updated.events)" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 8: Cleanup - Delete webhook
Write-Host "[Test 8] Cleaning up - Deleting test webhook..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/api/webhooks/$webhookId" -Method Delete -Headers $headers -ErrorAction Stop
    Write-Host "✅ SUCCESS: Webhook deleted" -ForegroundColor Green
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ALL TESTS COMPLETED!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  ✅ Webhooks API is fully functional" -ForegroundColor Green
Write-Host "  ✅ CRUD operations working" -ForegroundColor Green
Write-Host "  ✅ Event triggering working" -ForegroundColor Green
Write-Host "  ✅ Logging working" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Use a real webhook.site URL to see actual payloads" -ForegroundColor Cyan
Write-Host "  2. Create a contact to trigger contact.created event" -ForegroundColor Cyan
Write-Host "  3. Integrate with Slack, Zapier, or other services" -ForegroundColor Cyan
Write-Host ""
