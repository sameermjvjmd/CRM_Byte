# 🧪 Webhooks System - Testing Guide

## Test Plan

We'll test the following:
1. ✅ Create a webhook
2. ✅ Trigger a webhook event
3. ✅ View webhook logs
4. ✅ Test webhook endpoint
5. ✅ List available events

---

## Test 1: Create a Webhook

### Using Postman/Insomnia:

**Request:**
```http
POST http://localhost:5000/api/webhooks
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "name": "Test Webhook - Slack Notifications",
  "url": "https://webhook.site/unique-url",
  "events": "contact.created,opportunity.won,email.sent",
  "description": "Testing webhook delivery to webhook.site",
  "isActive": true
}
```

**Expected Response:**
```json
{
  "id": 1,
  "name": "Test Webhook - Slack Notifications",
  "url": "https://webhook.site/unique-url",
  "events": "contact.created,opportunity.won,email.sent",
  "secret": "auto-generated-base64-secret",
  "isActive": true,
  "description": "Testing webhook delivery to webhook.site",
  "triggerCount": 0,
  "lastTriggeredAt": null,
  "lastError": null,
  "failureCount": 0,
  "customHeaders": null,
  "createdAt": "2026-01-21T01:40:00Z",
  "updatedAt": null
}
```

---

## Test 2: Get Free Webhook Testing URL

### Option A: Webhook.site (Recommended)
1. Visit https://webhook.site
2. You'll get a unique URL like: `https://webhook.site/abc123-def456`
3. Use this URL when creating your webhook
4. All webhook deliveries will be visible in real-time on the website

### Option B: RequestBin
1. Visit https://requestbin.com
2. Create a new bin
3. Use the bin URL for testing

### Option C: Local Testing with ngrok
```bash
# Install ngrok
# Run a local server
python -m http.server 8000

# In another terminal, expose it
ngrok http 8000

# Use the ngrok URL in your webhook
```

---

## Test 3: List Available Events

**Request:**
```http
GET http://localhost:5000/api/webhooks/events
Authorization: Bearer {your_jwt_token}
```

**Expected Response:**
```json
[
  "contact.created",
  "contact.updated",
  "contact.deleted",
  "company.created",
  "company.updated",
  "company.deleted",
  "opportunity.created",
  "opportunity.updated",
  "opportunity.stage_changed",
  "opportunity.won",
  "opportunity.lost",
  "activity.created",
  "activity.completed",
  "email.sent",
  "email.opened",
  "email.clicked",
  "quote.created",
  "quote.sent",
  "quote.accepted",
  "quote.declined",
  "workflow.triggered",
  "campaign.sent",
  "webhook.test"
]
```

---

## Test 4: Test Webhook Delivery

**Request:**
```http
POST http://localhost:5000/api/webhooks/1/test
Authorization: Bearer {your_jwt_token}
```

**Expected Response:**
```json
{
  "message": "Test webhook triggered successfully"
}
```

**What Happens:**
1. System sends a test payload to your webhook URL
2. Payload includes:
   ```json
   {
     "event": "webhook.test",
     "data": {
       "message": "This is a test webhook event",
       "webhook_id": 1,
       "timestamp": "2026-01-21T01:40:00Z"
     },
     "timestamp": "2026-01-21T01:40:00Z",
     "webhook_id": 1
   }
   ```
3. Check webhook.site to see the delivery!

---

## Test 5: Trigger Real Event (Create Contact)

**Request:**
```http
POST http://localhost:5000/api/contacts
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "firstName": "Webhook",
  "lastName": "Test",
  "email": "webhook.test@example.com",
  "phone": "1234567890",
  "status": "Active"
}
```

**What Happens:**
1. Contact is created in CRM
2. System triggers `contact.created` event
3. Webhook service sends payload to your URL:
   ```json
   {
     "event": "contact.created",
     "data": {
       "id": 123,
       "firstName": "Webhook",
       "lastName": "Test",
       "email": "webhook.test@example.com",
       "phone": "1234567890",
       "status": "Active",
       "createdAt": "2026-01-21T01:40:00Z"
     },
     "timestamp": "2026-01-21T01:40:00Z",
     "webhook_id": 1
   }
   ```
4. Check webhook.site to see the delivery!

---

## Test 6: View Webhook Logs

**Request:**
```http
GET http://localhost:5000/api/webhooks/1/logs?limit=10
Authorization: Bearer {your_jwt_token}
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "webhookId": 1,
    "eventType": "webhook.test",
    "payload": "{\"event\":\"webhook.test\",\"data\":{...}}",
    "statusCode": 200,
    "response": "OK",
    "success": true,
    "errorMessage": null,
    "attemptNumber": 1,
    "createdAt": "2026-01-21T01:40:00Z"
  },
  {
    "id": 2,
    "webhookId": 1,
    "eventType": "contact.created",
    "payload": "{\"event\":\"contact.created\",\"data\":{...}}",
    "statusCode": 200,
    "response": "OK",
    "success": true,
    "errorMessage": null,
    "attemptNumber": 1,
    "createdAt": "2026-01-21T01:41:00Z"
  }
]
```

---

## Test 7: List All Webhooks

**Request:**
```http
GET http://localhost:5000/api/webhooks
Authorization: Bearer {your_jwt_token}
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "name": "Test Webhook - Slack Notifications",
    "url": "https://webhook.site/abc123",
    "events": "contact.created,opportunity.won,email.sent",
    "isActive": true,
    "triggerCount": 2,
    "lastTriggeredAt": "2026-01-21T01:41:00Z",
    "failureCount": 0
  }
]
```

---

## Test 8: Update Webhook

**Request:**
```http
PUT http://localhost:5000/api/webhooks/1
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "name": "Updated Webhook Name",
  "url": "https://webhook.site/new-url",
  "events": "contact.created,contact.updated",
  "isActive": true,
  "description": "Updated description"
}
```

---

## Test 9: Disable Webhook

**Request:**
```http
PUT http://localhost:5000/api/webhooks/1
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "name": "Test Webhook",
  "url": "https://webhook.site/abc123",
  "events": "contact.created",
  "isActive": false
}
```

---

## Test 10: Delete Webhook

**Request:**
```http
DELETE http://localhost:5000/api/webhooks/1
Authorization: Bearer {your_jwt_token}
```

**Expected Response:**
```
204 No Content
```

---

## 🎯 Quick Test Script (PowerShell)

Save this as `test-webhooks.ps1`:

```powershell
# Configuration
$baseUrl = "http://localhost:5000"
$token = "YOUR_JWT_TOKEN_HERE"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test 1: List available events
Write-Host "Test 1: Listing available events..." -ForegroundColor Cyan
$events = Invoke-RestMethod -Uri "$baseUrl/api/webhooks/events" -Headers $headers
Write-Host "Available events: $($events.Count)" -ForegroundColor Green
$events | ForEach-Object { Write-Host "  - $_" }

# Test 2: Create webhook
Write-Host "`nTest 2: Creating webhook..." -ForegroundColor Cyan
$webhookData = @{
    name = "Test Webhook"
    url = "https://webhook.site/unique-url"  # Replace with your URL
    events = "contact.created,opportunity.won"
    isActive = $true
} | ConvertTo-Json

$webhook = Invoke-RestMethod -Uri "$baseUrl/api/webhooks" -Method Post -Headers $headers -Body $webhookData
Write-Host "Webhook created with ID: $($webhook.id)" -ForegroundColor Green

# Test 3: Test webhook
Write-Host "`nTest 3: Testing webhook..." -ForegroundColor Cyan
$testResult = Invoke-RestMethod -Uri "$baseUrl/api/webhooks/$($webhook.id)/test" -Method Post -Headers $headers
Write-Host $testResult.message -ForegroundColor Green

# Test 4: View logs
Write-Host "`nTest 4: Viewing webhook logs..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
$logs = Invoke-RestMethod -Uri "$baseUrl/api/webhooks/$($webhook.id)/logs?limit=5" -Headers $headers
Write-Host "Logs found: $($logs.Count)" -ForegroundColor Green
$logs | ForEach-Object {
    Write-Host "  Event: $($_.eventType) | Status: $($_.statusCode) | Success: $($_.success)"
}

Write-Host "`nAll tests completed!" -ForegroundColor Green
```

---

## 🎯 Quick Test Script (Bash)

Save this as `test-webhooks.sh`:

```bash
#!/bin/bash

# Configuration
BASE_URL="http://localhost:5000"
TOKEN="YOUR_JWT_TOKEN_HERE"

# Test 1: List events
echo "Test 1: Listing available events..."
curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/webhooks/events" | jq .

# Test 2: Create webhook
echo -e "\nTest 2: Creating webhook..."
WEBHOOK_ID=$(curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Webhook",
    "url": "https://webhook.site/unique-url",
    "events": "contact.created,opportunity.won",
    "isActive": true
  }' \
  "$BASE_URL/api/webhooks" | jq -r '.id')

echo "Webhook created with ID: $WEBHOOK_ID"

# Test 3: Test webhook
echo -e "\nTest 3: Testing webhook..."
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/webhooks/$WEBHOOK_ID/test" | jq .

# Test 4: View logs
echo -e "\nTest 4: Viewing webhook logs..."
sleep 2
curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/webhooks/$WEBHOOK_ID/logs?limit=5" | jq .

echo -e "\nAll tests completed!"
```

---

## 📊 Expected Results

### ✅ Success Indicators:
1. Webhook created with ID
2. Test event sent successfully
3. Webhook.site shows received payload
4. Logs show successful delivery (status 200)
5. triggerCount increments

### ❌ Failure Indicators:
1. 401 Unauthorized - Check JWT token
2. 404 Not Found - Check webhook ID
3. 500 Server Error - Check logs
4. Webhook logs show failures - Check URL

---

## 🔍 Troubleshooting

### Issue: "Unauthorized"
**Solution**: Get a valid JWT token by logging in first

### Issue: Webhook not triggering
**Solution**: 
1. Check webhook is active
2. Check event name matches
3. Check webhook URL is accessible

### Issue: Webhook.site not receiving
**Solution**:
1. Verify URL is correct
2. Check webhook logs for errors
3. Try test endpoint first

---

## 🎉 Success Criteria

You'll know webhooks are working when:
- ✅ Webhook created successfully
- ✅ Test webhook sends payload
- ✅ Webhook.site receives payload
- ✅ Logs show successful delivery
- ✅ Real events trigger webhooks
- ✅ Signature verification works

---

**Ready to test? Let's do it!** 🚀
