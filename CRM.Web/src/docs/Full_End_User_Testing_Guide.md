# CRM Master End-User Testing Guide
**Version:** 1.2 (Marketing Automation Update)

This guide provides a complete, end-to-end walkthrough for validating the CRM application functionality. It is designed for QA testers and end-users to verify all major modules implemented to date.

---

## 🔐 Section 1: Authentication & Access
**Objective:** Verify secure access to the tenant environment.

1. **Login Page**
   - Navigate to the login URL.
   - Enter valid credentials (email/password).
   - Enter invalid credentials and verify error messages.
   - **Check**: Successful redirect to the Dashboard upon login.
2. **Tenant Context**
   - Verify the URL subdomain corresponds to the correct tenant data.
   - **Check**: User name and role are displayed correctly in the UI.

---

## 📊 Section 2: Dashboard & Navigation
**Objective:** specific workspace overview and navigation.

1. **Dashboard Widgets**
   - **KPI Cards**: Verify total counts for Contacts, Opportunities, and Activities.
   - **Recent Activity**: Check for the latest logs (calls, notes) appearing here.
   - **Upcoming Tasks**: Verify strictly future-dated tasks appear here.
2. **Navigation Sidebar**
   - Click through all main menu items: `Dashboard`, `Contacts`, `Companies`, `Opportunities`, `Calendar`, `Tasks`.
   - **Check**: Verify the active page is highlighted in the sidebar.

---

## 👥 Section 3: Contact Management (Core)
**Objective:** Manage individual person records.

1. **Create Contact**
   - Click `+ Add Contact`.
   - Fill in: First Name, Last Name, Email, Job Title.
   - **Advanced**: Use the "Custom Fields" section (if configured) to add extra data.
   - Click **Save**.
   - **Check**: Toast notification success and redirection/modal close.
2. **Contact List View**
   - Verify pagination (Next/Previous).
   - Use the **Search bar**: Type a name and verify results filter.
   - **Filters**: Filter by "My Contacts" or "Active".
3. **Contact Detail Page**
   - Open a contact.
   - **Tabs Verification**:
     - **Overview**: Check phone, email, and address display.
     - **Timeline/History**: Verify logs of past interactions.
     - **Custom Fields**: Verify your custom data (e.g., "T-Shirt Size") is visible and editable.
     - **Documents**: Upload a file and verify it appears in the list.
   - **Edit**: specific fields (change phone number) and Save. Verify update.

---

## 🏢 Section 4: Company Management (B2B)
**Objective:** Manage business accounts and hierarchies.

1. **Create Company**
   - Click `+ Add Company` via Modal or Page.
   - Enter Name, Industry, Website.
   - **Check**: Company created successfully.
2. **Company Detail View**
   - **Overview**: Check calculated metrics (Total Revenue, Employee Count).
   - **Contacts Tab**: Verify list of contacts linked to this company.
   - **Subsidiaries**: If applicable, specific parent/child company links.
   - **Custom Fields**: Verify company-specific custom fields (e.g., "Tax ID").
   - **Documents**: Verify document upload/download for company records.

---

## 💼 Section 5: Sales Pipeline (Opportunities)
**Objective:** specific deals and revenue tracking.

1. **Create Opportunity**
   - Create a deal linked to a Contact and Company.
   - Set **Amount**, **Stage** (e.g., "Discovery"), and **Close Date**.
2. **Pipeline/Kanban View**
   - (If applicable) Drag and drop a deal from "Discovery" to "Proposal".
   - **Check**: Stage updates automatically.
3. **Opportunity Detail Page**
   - **Products**: Click "Add Product". Add line items (e.g., "Consulting Hours" x 10).
   - **Check**: Total Opportunity Amount updates based on products.
   - **Stage History**: Verify the change from Discovery to Proposal is logged with a timestamp.
   - **Quotes**: (See Section 6).
   - **Closing**: Use "Mark Won" or "Mark Lost" buttons. Verify status change.

---

## 📜 Section 6: Quotes & Orders
**Objective:** Create and manage pricing proposals.

1. **Create Quote**
   - From an Opportunity, click "Create Quote".
   - **Check**: Line items from Opportunity are auto-populated.
   - **Edit**: Adjust quantities or discounts.
   - **Save**.
2. **Quote Detail View**
   - **PDF Generation**: Click "Download PDF". Verify the PDF opens/downloads with correct formatting.
   - **Status Flow**: Change status from "Draft" to "Sent" -> "Accepted".
   - **Emailing**: Click "Send Quote" (if email configured).

---

## 📅 Section 7: Activity Management
**Objective:** specific calendar events, tasks, and history.

1. **Schedule Activity**
   - Click global `+` > **Activity**.
   - Type: `Meeting` or `Call`.
   - Date/Time: Set for tomorrow.
   - Regarding: Link to a Contact or Opportunity.
   - Click **Save**.
2. **Calendar View**
   - Navigate to **Calendar**.
   - **Check**: The event appears on the correct day/time slot.
3. **Completion**
   - Open the activity.
   - Mark as **Completed**.
   - **Check**: Status changes to "History/Done".

---

## 📧 Section 8: Communication (Email)
**Objective:** Verify integrated email features.

1. **Send Email**
   - Go to a Contact.
   - Click **Send Email** (or Email Icon).
   - Compose a subject and body.
   - Click **Send**.
2. **Email History**
   - Go to the **Emails** tab on the Contact.
   - **Check**: The sent email appears in the log.

---

## 📢 Section 9: Marketing Automation Module
**Objective:** Verify end-to-end marketing campaigns, list segmentation, and engagement tracking.

1.  **Lists Management**
    - **Static Lists**: Create a list, manually add members.
    - **Dynamic Lists**: Create a list with rules (e.g., "City = New York"). Verify that new contacts matching the rule are auto-added by the background job.
    - **View Subscribers**: Click the "View Subscribers" button on any list card. Verify you can see the table of members and remove them if needed.
2.  **Email Templates**
    - Navigate to **Marketing > Templates**.
    - Click `+ New Template`.
    - Use the Drag-and-Drop builder to add Text, Images, and Buttons.
    - **Save** and verify the preview.
3.  **Standard (Blast) Campaigns**
    - Create a new Campaign (Type: "Standard").
    - Select a List and a Template.
    - Click **Start** (Play Icon).
    - **Check**: Toast notification "Campaign started". Status changes to "Active".
    - **Verify Email**: Recipient receives the email with correct content.
4.  **Drip Campaigns (Automation)**
    - Create a new Campaign (Type: "Drip").
    - Click the **Layers Icon** to manage steps.
    - **Add Steps**:
        - Step 1: "Welcome" (Delay: Immediately).
        - Step 2: "Follow-up" (Delay: 1 Unit: Day / 1 Hour).
    - **Start Campaign**.
    - **Check**: Step 1 sends immediately. Step 2 is scheduled for the future.
5.  **Analytics & Tracking**
    - **Opens**: Open a received campaign email. Refresh the Campaign list/stats. **Check**: "Opens" count increments.
    - **Clicks**: Click a link in the email. **Check**: "Clicks" count increments.
    - **Dashboard**: Verify the "Marketing Dashboard" shows the aggregate performance.
6.  **Landing Pages & Forms**
    - **Create Page**: Go to **Marketing > Landing Pages** and create a new page (e.g., "Newsletter Signup").
    - **Form Builder**:
        - Open the builder. Drag a **Form** block onto the canvas.
        - Click the form to select it. In the settings, choose a **Target List** (e.g., "Newsletter Subscribers").
        - (Optional) Set "Assign Leads To" to a specific user.
    - **Publishing**: Change status to **Published** in the header.
    - **Testing**:
        - Click **Preview** to open the public link.
        - Fill out the form with a new email address.
        - **Verify**: The new contact is created in CRM and added to the chosen Marketing List (check via "View Subscribers").

---

## 🔍 Section 10: Advanced Search (Lookup)
**Objective:** Complex queries.

1. **Advanced Lookup Page**
   - Go to `/lookup` (or "Advanced Search" in menu).
   - **Criteria Builder**: Add a rule (e.g., `City` contains `New York`).
   - Click **Search**.
   - **Check**: Results match the criteria.
2. **Save Search**
   - Click "Save Search".
   - Name it "NY Contacts".
   - Reload page and select "NY Contacts" from the dropdown.
   - **Check**: Criteria are re-loaded.

---

## 🛠️ Section 11: Admin & Custom Fields
**Objective:** Validate system extensibility.

1. **Configuration**
   - Go to **Admin > Custom Fields**.
   - Create a new field for **Contact** (e.g., `VIP Status` - Boolean).
   - Create a new field for **Opportunity** (e.g., `Competitor Name` - Text).
2. **Usage Verification**
   - Go to a Contact.
   - detailed the **Custom Fields** tab.
   - Set `VIP Status` to "Yes".
   - **Save**.
   - Refresh page. **Check**: Value persists.
3. **Create Modal Integration**
   - Open "Create Contact" modal.
   - **Check**: The "VIP Status" toggle is available during creation.

---

## ✅ End-User Acceptance Criteria
The application is considered **Stable** for this release if:
- [ ] Users can log in and navigate without 404 errors.
- [ ] Core CRUD operations (Create, Read, Update, Delete) work for Contacts, Companies, and Opportunities.
- [ ] The "Custom Fields" feature is functional.
- [ ] Quotes can be created and PDFs generated.
- [ ] Marketing Campaigns (Blast & Drip) execute correctly.
- [ ] Advanced Search returns correct results.
- [ ] No critical "Red Screen" crashes occur during normal workflow.
- [ ] Data persists accurately after page reloads.
