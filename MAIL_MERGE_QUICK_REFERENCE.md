# 📧 Mail Merge / Bulk Email - Quick Reference

## ✅ What Has Been Implemented

### Backend (API)
1. **`BulkEmailDTOs.cs`** - Data transfer objects for bulk email requests and responses
2. **`EmailsController.cs`** - New endpoint `POST /api/emails/bulk` for sending bulk emails
3. **Placeholder Support** - Automatic replacement of contact-specific data

### Frontend (React)
1. **`BulkEmailComposer.tsx`** - Complete UI component for bulk email functionality
2. **Integration Examples** - Ready-to-use code snippets for contacts page

### Documentation
1. **`MAIL_MERGE_GUIDE.md`** - Comprehensive user guide
2. **`BulkEmailIntegrationExample.tsx`** - Code examples for developers
3. **Flow Diagram** - Visual representation of the process

---

## 🚀 Quick Start (5 Steps)

### 1. Add to Your Contacts Page
```tsx
import BulkEmailComposer from '../components/email/BulkEmailComposer';

const [selectedContacts, setSelectedContacts] = useState([]);
const [showBulkEmail, setShowBulkEmail] = useState(false);
```

### 2. Add Selection UI
```tsx
{selectedContacts.length > 0 && (
  <button onClick={() => setShowBulkEmail(true)}>
    Send Bulk Email ({selectedContacts.length})
  </button>
)}
```

### 3. Add the Component
```tsx
<BulkEmailComposer
  isOpen={showBulkEmail}
  onClose={() => setShowBulkEmail(false)}
  selectedContacts={selectedContacts}
  onSent={() => setSelectedContacts([])}
/>
```

### 4. Add Checkboxes to Contact List
```tsx
<input
  type="checkbox"
  checked={selectedContacts.some(c => c.id === contact.id)}
  onChange={() => toggleContactSelection(contact)}
/>
```

### 5. Test It!
- Select contacts
- Click "Send Bulk Email"
- Choose template or write message
- Use placeholders like `{{FirstName}}`
- Send!

---

## 📝 Available Placeholders

| Placeholder | Description | Example |
|------------|-------------|---------|
| `{{ContactName}}` | Full name | "John Doe" |
| `{{FirstName}}` | First name only | "John" |
| `{{LastName}}` | Last name only | "Doe" |
| `{{Email}}` | Email address | "john@example.com" |
| `{{CompanyName}}` | Company name | "Acme Corp" |
| `{{JobTitle}}` | Job title | "CEO" |
| `{{Phone}}` | Phone number | "+1234567890" |

---

## 💡 Example Email Templates

### Welcome Email
```
Subject: Welcome {{FirstName}}!

Dear {{ContactName}},

Welcome to our platform! We're excited to have {{CompanyName}} on board.

Best regards,
Team
```

### Newsletter
```
Subject: Monthly Update for {{CompanyName}}

Hi {{FirstName}},

Here's what's new this month...
```

### Follow-up
```
Subject: Following up with you, {{FirstName}}

Dear {{ContactName}},

As {{JobTitle}} at {{CompanyName}}, you might be interested in...
```

---

## 🔧 API Endpoint

### Request
```http
POST /api/emails/bulk
Content-Type: application/json

{
  "contactIds": [1, 2, 3],
  "templateId": 5,
  "subject": "Hello {{FirstName}}!",
  "body": "Dear {{ContactName}}, ...",
  "scheduledFor": "2026-01-25T10:00:00Z"
}
```

### Response
```json
{
  "totalAttempted": 3,
  "successfullySent": 2,
  "failed": 1,
  "scheduled": 0,
  "results": [
    {
      "contactId": 1,
      "contactName": "John Doe",
      "emailAddress": "john@example.com",
      "success": true
    }
  ]
}
```

---

## 🎯 Use Cases

1. **Newsletter Campaigns** - Send monthly updates to all clients
2. **Event Invitations** - Invite contacts to webinars or events
3. **Product Announcements** - Announce new features or products
4. **Follow-up Campaigns** - Automated follow-ups after meetings
5. **Seasonal Greetings** - Holiday wishes to all contacts
6. **Survey Distribution** - Send surveys to customer segments
7. **Onboarding Sequences** - Welcome new clients
8. **Re-engagement** - Win back inactive contacts

---

## ⚙️ Features

✅ **Personalization** - Each email is customized per recipient
✅ **Template Support** - Use pre-created email templates
✅ **Scheduling** - Send now or schedule for later
✅ **Attachments** - Include files in bulk emails
✅ **Progress Tracking** - See real-time send status
✅ **Error Handling** - Detailed failure reasons
✅ **HTML Support** - Rich formatted emails
✅ **BCC Support** - Copy yourself on all emails

---

## 📊 Results Tracking

After sending, you'll see:
- **Total Attempted** - How many emails were processed
- **Successfully Sent** - Emails delivered successfully
- **Failed** - Emails that couldn't be sent (with reasons)
- **Scheduled** - Emails queued for later delivery

Each result includes:
- Contact name
- Email address
- Success/failure status
- Error message (if failed)

---

## 🔐 Best Practices

1. **Test First** - Send to yourself before mass sending
2. **Segment Wisely** - Group contacts by relevance
3. **Personalize** - Use placeholders for better engagement
4. **Respect Privacy** - Include unsubscribe options
5. **Monitor Results** - Check for bounces and failures
6. **Time It Right** - Schedule for optimal times
7. **Keep It Relevant** - Only send valuable content
8. **Follow Up** - Track opens and clicks

---

## 🐛 Troubleshooting

### Placeholders Not Replaced
- Check syntax: `{{PlaceholderName}}`
- Ensure contact has data for that field

### Emails Not Sending
- Verify SMTP settings in Email Settings
- Check contact has valid email address

### Going to Spam
- Add SPF/DKIM records
- Use verified sender address
- Include unsubscribe link

---

## 📁 Files Created

### Backend
- `CRM.Api/DTOs/Email/BulkEmailDTOs.cs`
- `CRM.Api/Controllers/EmailsController.cs` (updated)

### Frontend
- `CRM.Web/src/components/email/BulkEmailComposer.tsx`
- `CRM.Web/src/examples/BulkEmailIntegrationExample.tsx`

### Documentation
- `MAIL_MERGE_GUIDE.md` (comprehensive guide)
- `MAIL_MERGE_QUICK_REFERENCE.md` (this file)

---

## 🎓 Next Steps

1. **Integrate into Contacts Page**
   - Add selection checkboxes
   - Add bulk email button
   - Import BulkEmailComposer component

2. **Create Email Templates**
   - Go to Email Templates section
   - Create templates with placeholders
   - Mark favorites as default

3. **Configure SMTP**
   - Set up email server settings
   - Test email delivery
   - Configure SPF/DKIM

4. **Train Users**
   - Share MAIL_MERGE_GUIDE.md
   - Demonstrate placeholder usage
   - Show best practices

5. **Monitor & Optimize**
   - Track open rates
   - Analyze click rates
   - Refine templates based on results

---

## 📞 Support

For questions or issues:
1. Check `MAIL_MERGE_GUIDE.md` for detailed documentation
2. Review integration examples in `BulkEmailIntegrationExample.tsx`
3. Test API endpoint with Swagger/Postman
4. Contact system administrator

---

**Happy Emailing! 📧**
