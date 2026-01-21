# Mail Merge / Bulk Email Guide

## Overview
The Mail Merge feature allows you to send personalized emails to multiple contacts at once. Each email is customized with the recipient's information using placeholders.

## Features
✅ Send to multiple contacts simultaneously
✅ Personalize emails with contact-specific data
✅ Use email templates
✅ Schedule bulk emails for later
✅ Track success/failure for each recipient
✅ Support for attachments
✅ HTML email support

---

## How to Use Mail Merge

### Step 1: Select Contacts
1. Go to the **Contacts** page
2. Select multiple contacts using checkboxes
3. Click the **"Bulk Email"** or **"Send Email to Selected"** button

### Step 2: Compose Your Email
1. **Choose a Template** (Optional)
   - Select from pre-created email templates
   - Templates automatically populate subject and body

2. **Use Placeholders** for Personalization
   Available placeholders:
   - `{{ContactName}}` - Full name (First + Last)
   - `{{FirstName}}` - Contact's first name
   - `{{LastName}}` - Contact's last name
   - `{{Email}}` - Contact's email address
   - `{{CompanyName}}` - Company name
   - `{{JobTitle}}` - Job title
   - `{{Phone}}` - Phone number

3. **Write Your Message**
   Example:
   ```
   Subject: Hello {{FirstName}}, Special Offer for {{CompanyName}}!

   Body:
   Dear {{ContactName}},

   We hope this email finds you well at {{CompanyName}}.

   As a valued {{JobTitle}}, we're offering you an exclusive discount...

   Best regards,
   Your CRM Team
   ```

4. **Add Attachments** (Optional)
   - Click "Attach File" to add documents
   - Same attachment will be sent to all recipients

5. **Schedule** (Optional)
   - Leave blank to send immediately
   - Or select a date/time to schedule for later

### Step 3: Send
1. Click **"Send to All"** button
2. View real-time progress
3. See detailed results showing:
   - ✅ Successfully sent
   - ❌ Failed (with error reason)
   - 📅 Scheduled

---

## Example Use Cases

### 1. Newsletter to All Clients
```
Subject: Monthly Newsletter - {{CompanyName}}

Dear {{ContactName}},

Here's what's new this month...
```

### 2: Event Invitation
```
Subject: You're Invited, {{FirstName}}!

Hi {{FirstName}},

We're hosting an exclusive event and would love to see you there...
```

### 3. Follow-up Campaign
```
Subject: Following up with {{CompanyName}}

Dear {{ContactName}},

Thank you for your interest in our services. As {{JobTitle}} at {{CompanyName}}, 
you might be interested in...
```

### 4. Product Announcement
```
Subject: New Product Launch - Special Pricing for {{CompanyName}}

Hello {{FirstName}},

We're excited to announce our new product, and we're offering special pricing 
for valued partners like {{CompanyName}}...
```

---

## Integration Points

### From Contacts Page
```tsx
import BulkEmailComposer from '../components/email/BulkEmailComposer';

const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
const [showBulkEmail, setShowBulkEmail] = useState(false);

// In your JSX:
<button onClick={() => setShowBulkEmail(true)}>
  Send Bulk Email ({selectedContacts.length})
</button>

<BulkEmailComposer
  isOpen={showBulkEmail}
  onClose={() => setShowBulkEmail(false)}
  selectedContacts={selectedContacts}
  onSent={() => {
    // Refresh data or show success message
    setSelectedContacts([]);
  }}
/>
```

### From Groups/Segments
You can also use bulk email from:
- Contact groups
- Filtered contact lists
- Saved segments
- Campaign targets

---

## API Endpoint

### POST `/api/emails/bulk`

**Request:**
```json
{
  "contactIds": [1, 2, 3, 4, 5],
  "templateId": 10,
  "subject": "Hello {{FirstName}}!",
  "body": "Dear {{ContactName}}, ...",
  "attachmentIds": [1, 2],
  "requestReadReceipt": false,
  "scheduledFor": "2026-01-25T10:00:00Z",
  "bcc": "admin@company.com"
}
```

**Response:**
```json
{
  "totalAttempted": 5,
  "successfullySent": 4,
  "failed": 1,
  "scheduled": 0,
  "results": [
    {
      "contactId": 1,
      "contactName": "John Doe",
      "emailAddress": "john@example.com",
      "success": true,
      "sentEmailId": 123
    },
    {
      "contactId": 2,
      "contactName": "Jane Smith",
      "emailAddress": "",
      "success": false,
      "errorMessage": "No email address"
    }
  ],
  "errors": [
    "Failed to send to : No email address"
  ]
}
```

---

## Best Practices

### 1. Test First
- Send a test email to yourself first
- Verify placeholders are replaced correctly
- Check formatting and links

### 2. Segment Your Audience
- Don't send to all contacts at once
- Group by industry, location, or interest
- Personalize content for each segment

### 3. Use Templates
- Create reusable templates for common campaigns
- Include placeholders for personalization
- Save time on future campaigns

### 4. Monitor Results
- Check the results after sending
- Follow up on failed emails
- Track open and click rates

### 5. Respect Privacy
- Include unsubscribe links
- Honor opt-out requests
- Comply with email regulations (GDPR, CAN-SPAM)

### 6. Timing Matters
- Use scheduling for optimal send times
- Consider time zones
- Avoid weekends/holidays for business emails

---

## Troubleshooting

### "No email address" Error
- Contact doesn't have an email in the system
- Update contact information before sending

### "Failed to send" Error
- Check SMTP settings in Email Settings
- Verify email server is accessible
- Check for invalid email addresses

### Placeholders Not Replaced
- Ensure correct syntax: `{{PlaceholderName}}`
- Check spelling (case-sensitive)
- Verify contact has data for that field

### Emails Going to Spam
- Add SPF/DKIM records to your domain
- Avoid spam trigger words
- Include unsubscribe link
- Use a verified sender address

---

## Advanced Features

### 1. Conditional Content
While not built-in, you can create multiple templates for different scenarios:
- Template A: For contacts with company
- Template B: For individual contacts

### 2. A/B Testing
Send different versions to test effectiveness:
- Create two templates
- Send each to half your list
- Compare open/click rates

### 3. Drip Campaigns
Combine with scheduling:
- Day 1: Welcome email
- Day 3: Product information
- Day 7: Special offer
- Day 14: Follow-up

### 4. Integration with Workflows
Set up automated bulk emails triggered by:
- Contact status changes
- Date-based triggers
- Custom events

---

## Email Template Examples

### Template 1: Welcome Email
```
Name: New Client Welcome
Subject: Welcome to [Your Company], {{FirstName}}!

Body:
<h2>Welcome, {{ContactName}}!</h2>

<p>Thank you for choosing [Your Company]. We're excited to have {{CompanyName}} as our partner.</p>

<p>As {{JobTitle}}, you'll have access to:</p>
<ul>
  <li>Dedicated account manager</li>
  <li>24/7 support</li>
  <li>Exclusive resources</li>
</ul>

<p>If you have any questions, feel free to reach out at {{Email}}.</p>

<p>Best regards,<br>
The [Your Company] Team</p>
```

### Template 2: Monthly Newsletter
```
Name: Monthly Newsletter
Subject: {{CompanyName}} - Your Monthly Update

Body:
<h2>Hi {{FirstName}},</h2>

<p>Here's what's new this month...</p>

<h3>📰 Latest News</h3>
<p>[News content]</p>

<h3>💡 Tips & Tricks</h3>
<p>[Tips content]</p>

<h3>📅 Upcoming Events</h3>
<p>[Events content]</p>

<p>Stay connected,<br>
[Your Name]</p>
```

### Template 3: Special Offer
```
Name: Special Offer
Subject: Exclusive Offer for {{ContactName}}

Body:
<h2>Hello {{FirstName}},</h2>

<p>As a valued partner at {{CompanyName}}, we're offering you an exclusive 20% discount!</p>

<p><strong>Your personalized discount code:</strong> {{LastName}}20</p>

<p>This offer is valid until [Date].</p>

<p>Questions? Contact us at [Phone] or reply to this email.</p>

<p>Best regards,<br>
Sales Team</p>
```

---

## Summary

The Mail Merge feature is a powerful tool for:
- ✅ Saving time on repetitive emails
- ✅ Personalizing mass communications
- ✅ Maintaining professional relationships at scale
- ✅ Tracking campaign effectiveness

**Remember:** Personalization is key! Use placeholders to make each recipient feel the email was written specifically for them.

---

## Quick Start Checklist

- [ ] Create email templates with placeholders
- [ ] Configure SMTP settings
- [ ] Select target contacts
- [ ] Compose or choose template
- [ ] Preview with sample contact
- [ ] Send test email to yourself
- [ ] Send to all selected contacts
- [ ] Monitor results
- [ ] Follow up on failures
- [ ] Track engagement metrics

---

For more help, contact your system administrator or refer to the Email Settings documentation.
