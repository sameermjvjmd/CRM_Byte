# 🔗 Real Webhook Integrations - Setup Guide

## Quick Start: Slack + Zapier Integration

This guide will help you set up real webhook integrations with Slack and Zapier.

---

## 🎯 **Option 1: Slack Integration** (Recommended - Easiest)

### **Step 1: Create Slack Incoming Webhook**

1. **Go to Slack API**: https://api.slack.com/apps
2. **Create New App**:
   - Click "Create New App"
   - Choose "From scratch"
   - App Name: "CRM Notifications"
   - Workspace: Select your workspace
   - Click "Create App"

3. **Enable Incoming Webhooks**:
   - In the left sidebar, click "Incoming Webhooks"
   - Toggle "Activate Incoming Webhooks" to ON
   - Click "Add New Webhook to Workspace"
   - Select the channel (e.g., #crm-notifications)
   - Click "Allow"

4. **Copy Webhook URL**:
   - You'll see a URL like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`
   - Copy this URL - we'll use it in the next step

### **Step 2: Create Webhook in Your CRM**

**Using PowerShell:**
```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$slackUrl = "YOUR_SLACK_WEBHOOK_URL_HERE"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$webhookData = @{
    name = "Slack - CRM Notifications"
    url = $slackUrl
    events = "contact.created,opportunity.won,quote.accepted,email.sent"
    description = "Send important CRM events to Slack"
    isActive = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/webhooks" -Method Post -Headers $headers -Body $webhookData
```

**Using cURL:**
```bash
curl -X POST http://localhost:5000/api/webhooks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Slack - CRM Notifications",
    "url": "YOUR_SLACK_WEBHOOK_URL",
    "events": "contact.created,opportunity.won,quote.accepted,email.sent",
    "description": "Send important CRM events to Slack",
    "isActive": true
  }'
```

### **Step 3: Test It!**

Create a new contact in your CRM and watch Slack for the notification!

**Expected Slack Message:**
```
New CRM Event: contact.created
Contact: John Doe (john@example.com)
Company: Acme Corp
Time: 2026-01-21 01:50:00
```

### **Step 4: Customize Slack Messages (Optional)**

To get better-formatted Slack messages, you'll need to create a middleware service that:
1. Receives webhook from CRM
2. Formats it for Slack
3. Sends to Slack

**Quick Node.js Example:**
```javascript
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const SLACK_WEBHOOK = 'YOUR_SLACK_WEBHOOK_URL';

app.post('/webhook', async (req, res) => {
  const { event, data, timestamp } = req.body;
  
  // Format message for Slack
  let message = {
    text: `🔔 *${event}*`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `🔔 ${event.replace('.', ' ').toUpperCase()}`
        }
      },
      {
        type: "section",
        fields: Object.keys(data).map(key => ({
          type: "mrkdwn",
          text: `*${key}:*\n${data[key]}`
        }))
      },
      {
        type: "context",
        elements: [{
          type: "mrkdwn",
          text: `⏰ ${new Date(timestamp).toLocaleString()}`
        }]
      }
    ]
  };
  
  // Send to Slack
  await axios.post(SLACK_WEBHOOK, message);
  res.sendStatus(200);
});

app.listen(3001, () => console.log('Webhook server running on port 3001'));
```

---

## 🎯 **Option 2: Zapier Integration** (Most Powerful)

### **Step 1: Create Zapier Webhook**

1. **Go to Zapier**: https://zapier.com
2. **Create New Zap**:
   - Click "Create Zap"
   - For Trigger, search "Webhooks by Zapier"
   - Choose "Catch Hook"
   - Copy the webhook URL provided

3. **Create Webhook in CRM**:
```powershell
$webhookData = @{
    name = "Zapier - Automation Hub"
    url = "https://hooks.zapier.com/hooks/catch/YOUR_ID/YOUR_KEY"
    events = "contact.created,opportunity.won,quote.accepted"
    description = "Trigger Zapier workflows"
    isActive = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/webhooks" -Method Post -Headers $headers -Body $webhookData
```

4. **Test the Webhook**:
   - Create a contact in your CRM
   - Go back to Zapier
   - Click "Test trigger"
   - You should see the webhook data

5. **Add Actions**:
   Now you can add any of 5000+ actions:
   - Add to Google Sheets
   - Send email via Gmail
   - Create Trello card
   - Add to Mailchimp
   - Create invoice in QuickBooks
   - Send SMS via Twilio
   - Post to social media
   - And much more!

### **Example Zap Workflows:**

**Workflow 1: New Contact → Google Sheets**
- Trigger: Webhook (contact.created)
- Action: Add row to Google Sheets
- Result: All new contacts automatically logged

**Workflow 2: Deal Won → Multiple Actions**
- Trigger: Webhook (opportunity.won)
- Action 1: Send celebration email
- Action 2: Create invoice in QuickBooks
- Action 3: Add to Google Calendar
- Action 4: Post to Slack
- Action 5: Send SMS to sales team

**Workflow 3: Quote Accepted → Onboarding**
- Trigger: Webhook (quote.accepted)
- Action 1: Create Trello card
- Action 2: Send welcome email
- Action 3: Schedule kickoff meeting
- Action 4: Add to project management tool

---

## 🎯 **Option 3: Webhook.site Testing** (For Development)

### **Step 1: Get Unique URL**

1. Visit: https://webhook.site
2. You'll get a unique URL like: `https://webhook.site/abc123-def456`
3. Keep this page open - you'll see all webhooks in real-time

### **Step 2: Create Webhook**

```powershell
$webhookData = @{
    name = "Webhook.site - Testing"
    url = "https://webhook.site/YOUR_UNIQUE_ID"
    events = "contact.created,opportunity.won,email.sent,quote.accepted"
    description = "Testing webhook payloads"
    isActive = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/webhooks" -Method Post -Headers $headers -Body $webhookData
```

### **Step 3: Trigger Events**

Create a contact, win an opportunity, or send an email - you'll see the webhook payloads instantly on webhook.site!

**Benefits:**
- See exact payload structure
- Test signature verification
- Debug webhook issues
- No setup required

---

## 🎯 **Option 4: Custom Integration**

### **Build Your Own Webhook Receiver**

**Node.js Example:**
```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// Your webhook secret from CRM
const WEBHOOK_SECRET = 'your-webhook-secret-here';

// Verify webhook signature
function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest('base64');
  return digest === signature;
}

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  
  // Verify signature
  if (!verifySignature(payload, signature)) {
    return res.status(401).send('Invalid signature');
  }
  
  const { event, data, timestamp } = req.body;
  
  console.log(`Received event: ${event}`);
  console.log('Data:', data);
  
  // Handle different events
  switch(event) {
    case 'contact.created':
      handleNewContact(data);
      break;
    case 'opportunity.won':
      handleDealWon(data);
      break;
    case 'quote.accepted':
      handleQuoteAccepted(data);
      break;
    default:
      console.log('Unhandled event:', event);
  }
  
  res.sendStatus(200);
});

function handleNewContact(data) {
  console.log('New contact:', data.firstName, data.lastName);
  // Add to your database
  // Send welcome email
  // Add to mailing list
  // etc.
}

function handleDealWon(data) {
  console.log('Deal won:', data.name, data.amount);
  // Create invoice
  // Send celebration email
  // Update accounting system
  // etc.
}

function handleQuoteAccepted(data) {
  console.log('Quote accepted:', data.quoteNumber);
  // Start onboarding process
  // Create project
  // Schedule kickoff
  // etc.
}

app.listen(3000, () => {
  console.log('Webhook receiver running on port 3000');
});
```

**Python Example:**
```python
from flask import Flask, request, jsonify
import hmac
import hashlib
import base64
import json

app = Flask(__name__)

WEBHOOK_SECRET = 'your-webhook-secret-here'

def verify_signature(payload, signature):
    digest = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload.encode(),
        hashlib.sha256
    ).digest()
    expected = base64.b64encode(digest).decode()
    return expected == signature

@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Webhook-Signature')
    payload = request.get_data(as_text=True)
    
    if not verify_signature(payload, signature):
        return 'Invalid signature', 401
    
    data = request.json
    event = data['event']
    event_data = data['data']
    
    print(f'Received event: {event}')
    print(f'Data: {event_data}')
    
    # Handle events
    if event == 'contact.created':
        handle_new_contact(event_data)
    elif event == 'opportunity.won':
        handle_deal_won(event_data)
    elif event == 'quote.accepted':
        handle_quote_accepted(event_data)
    
    return 'OK', 200

def handle_new_contact(data):
    print(f"New contact: {data.get('firstName')} {data.get('lastName')}")
    # Your logic here

def handle_deal_won(data):
    print(f"Deal won: {data.get('name')} - ${data.get('amount')}")
    # Your logic here

def handle_quote_accepted(data):
    print(f"Quote accepted: {data.get('quoteNumber')}")
    # Your logic here

if __name__ == '__main__':
    app.run(port=3000)
```

---

## 📊 **Quick Setup Script**

Save this as `setup-integrations.ps1`:

```powershell
# Quick Integration Setup Script
param(
    [string]$SlackUrl = "",
    [string]$ZapierUrl = "",
    [string]$WebhookSiteUrl = ""
)

$token = "YOUR_JWT_TOKEN_HERE"
$baseUrl = "http://localhost:5000"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CRM WEBHOOK INTEGRATIONS SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Setup Slack
if ($SlackUrl) {
    Write-Host "Setting up Slack integration..." -ForegroundColor Yellow
    $slackData = @{
        name = "Slack - CRM Notifications"
        url = $SlackUrl
        events = "contact.created,opportunity.won,quote.accepted,email.sent"
        description = "Real-time CRM notifications to Slack"
        isActive = $true
    } | ConvertTo-Json
    
    try {
        $slack = Invoke-RestMethod -Uri "$baseUrl/api/webhooks" -Method Post -Headers $headers -Body $slackData
        Write-Host "✅ Slack webhook created (ID: $($slack.id))" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to create Slack webhook: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Setup Zapier
if ($ZapierUrl) {
    Write-Host "Setting up Zapier integration..." -ForegroundColor Yellow
    $zapierData = @{
        name = "Zapier - Automation Hub"
        url = $ZapierUrl
        events = "contact.created,opportunity.won,quote.accepted,deal.lost,email.sent"
        description = "Trigger Zapier workflows from CRM events"
        isActive = $true
    } | ConvertTo-Json
    
    try {
        $zapier = Invoke-RestMethod -Uri "$baseUrl/api/webhooks" -Method Post -Headers $headers -Body $zapierData
        Write-Host "✅ Zapier webhook created (ID: $($zapier.id))" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to create Zapier webhook: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Setup Webhook.site
if ($WebhookSiteUrl) {
    Write-Host "Setting up Webhook.site for testing..." -ForegroundColor Yellow
    $testData = @{
        name = "Webhook.site - Testing"
        url = $WebhookSiteUrl
        events = "contact.created,opportunity.won,quote.accepted,email.sent"
        description = "Testing and debugging webhooks"
        isActive = $true
    } | ConvertTo-Json
    
    try {
        $test = Invoke-RestMethod -Uri "$baseUrl/api/webhooks" -Method Post -Headers $headers -Body $testData
        Write-Host "✅ Webhook.site webhook created (ID: $($test.id))" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to create Webhook.site webhook: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Create a contact to test Slack notifications" -ForegroundColor Cyan
Write-Host "  2. Win an opportunity to test Zapier workflows" -ForegroundColor Cyan
Write-Host "  3. Check webhook.site to see payloads" -ForegroundColor Cyan
Write-Host ""
```

**Usage:**
```powershell
# Setup all integrations
.\setup-integrations.ps1 `
  -SlackUrl "https://hooks.slack.com/services/YOUR/WEBHOOK" `
  -ZapierUrl "https://hooks.zapier.com/hooks/catch/YOUR_ID" `
  -WebhookSiteUrl "https://webhook.site/YOUR_UNIQUE_ID"

# Setup only Slack
.\setup-integrations.ps1 -SlackUrl "https://hooks.slack.com/services/YOUR/WEBHOOK"

# Setup only Zapier
.\setup-integrations.ps1 -ZapierUrl "https://hooks.zapier.com/hooks/catch/YOUR_ID"
```

---

## 🎯 **Recommended Setup for Production**

1. **Slack** - For team notifications
2. **Zapier** - For automation workflows
3. **Custom Webhook** - For your own integrations

**Example Production Setup:**
```powershell
# 1. Slack for notifications
$slack = @{
    name = "Slack - Sales Team"
    url = "https://hooks.slack.com/services/YOUR/WEBHOOK"
    events = "opportunity.won,quote.accepted"
    isActive = $true
}

# 2. Zapier for automation
$zapier = @{
    name = "Zapier - Workflows"
    url = "https://hooks.zapier.com/hooks/catch/YOUR_ID"
    events = "contact.created,opportunity.won"
    isActive = $true
}

# 3. Custom analytics
$analytics = @{
    name = "Analytics Platform"
    url = "https://your-analytics.com/webhook"
    events = "email.sent,email.opened,email.clicked"
    isActive = $true
}
```

---

## 📚 **Resources**

- **Slack Webhooks**: https://api.slack.com/messaging/webhooks
- **Zapier Webhooks**: https://zapier.com/apps/webhook/integrations
- **Webhook.site**: https://webhook.site
- **CRM API Docs**: http://localhost:5000/scalar/v1

---

## 🎉 **Ready to Start!**

Choose your integration:
1. **Slack** - Easiest, great for notifications
2. **Zapier** - Most powerful, 5000+ integrations
3. **Webhook.site** - Best for testing
4. **Custom** - Full control

**Let's set it up!** 🚀
