# 🧪 Act! CRM - Comprehensive System Test Guide

This document serves as a master test plan for the entire CRM application. It covers all currently implemented modules and features. Use this guide for manual regression testing, user acceptance testing (UAT), and training.

---

## 🏗️ Core Application
### 1. Authentication & Navigation
- **Login:**
  - [ ] Log in with valid credentials.
  - [ ] Verify redirection to Dashboard.
  - [ ] Default credentials (dev mode): `admin` / `password`.
- **Navigation:**
  - [ ] Verify Sidebar expands/collapses.
  - [ ] Test all sidebar links (Contacts, Companies, Groups, etc.).
  - [ ] Verify "Quick Actions" (+ button) opens the Create Modal.

### 2. Dashboard
- **Widgets:**
  - [ ] Verify "My Tasks" shows upcoming activities.
  - [ ] Verify "Pipeline Value" matches open opportunities.
  - [ ] Verify "Recent Contacts" lists recently accessed records.
  - [ ] Click on any record in a widget to verify navigation to its detail page.

---

## 👥 Module 1: Contact Management

### 1.1 Contact List
- **Viewing:**
  - [ ] Navigate to `/contacts`. Verify pagination works (Next/Prev).
  - [ ] Use the search bar above the list to find a contact by name.
- **Actions:**
  - [ ] Select a contact checkbox -> Verify "Bulk Actions" appear (Delete, Add to Group).

### 1.2 Creating Contacts
- **Create Modal:**
  - [ ] Click **+ Create New** -> Select **Contact**.
  - [ ] Fill required fields (First Name, Last Name, Email).
  - [ ] Click **Create**. Verify success message and redirection/refresh.

### 1.3 Contact Detail View
- **Information:**
  - [ ] Open a contact. Verify Email, Phone, and Address are displayed.
  - [ ] Click **Edit** (pencil icon). Change a field (e.g., Job Title) and Save. Verify update.
- **Tabs:**
  - [ ] **Activities:** Click "Schedule Activity". Create a call. Verify it appears in the list.
  - [ ] **History:** Verify past closed activities appear here.
  - [ ] **Notes:** Add a text note. Verify it saves with timestamp.
  - [ ] **Opportunities:** Verify related deals are listed.
  - [ ] **Documents:** Upload a dummy file. Verify it appears in the list.

### 1.4 Extended Contact Details
- **Personal Info:**
  - [ ] Go to **Personal** tab.
  - [ ] Enter Birthday/Anniversary. Save.
  - [ ] Refresh page and verify dates persist.
- **Web Info:**
  - [ ] Go to **Web Info** tab.
  - [ ] Add a LinkedIn URL and Website. Save.
- **Multiple Emails:**
  - [ ] Go to **Email Addresses** tab.
  - [ ] Add a second email (e.g., "personal@example.com").
  - [ ] Set it as Primary. Verify the main header updates to this new email.
- **Addresses:**
  - [ ] Go to **Addresses** tab.
  - [ ] Add a "Home" address. Save.

---

## 🏢 Module 2: Company Management

### 2.1 Company Records
- **CRUD:**
  - [ ] Create a new Company (e.g., "Acme Corp").
  - [ ] Edit the company details (Industry, Website, **Parent Company**).
  - [ ] Delete a test company.

### 2.2 Company Details
- **Associations:**
  - [ ] Verify that Contacts linked to this company appear in the **Contacts** tab (if implemented) or Overview.
  - [ ] Check **Overview** tab for aggregate stats.
  - [ ] **Hierarchy:** Verify "Subsidiaries" tab lists linked child companies.

---

## 👥 Module 3: Group Management

### 3.1 Static Groups
- **Creation:**
  - [ ] Create a new Group (Standard). Name it "Holiday Card List".
- **Membership:**
  - [ ] Open the group. Click **Add Members**.
  - [ ] Select contacts from the popup list and confirm.
  - [ ] Verify the member count increases.
  - [ ] Remove a member and verify count decreases.

### 3.2 Dynamic Groups (Smart Groups)
- **Creation:**
  - [ ] Ensure you have a **Saved Search** (see Module 6).
  - [ ] Create a Group -> Toggle **Dynamic Group** ON.
  - [ ] Select the Saved Search.
  - [ ] **Verification:** Open the group. It should automatically list contacts matching the search criteria. You should NOT be able to manually add/remove members.

---

## 📅 Module 4: Activities & Calendar

### 4.1 Activity Management
- **Creation:**
  - [ ] Schedule a **Meeting** for tomorrow at 2:00 PM.
  - [ ] Select a Contact to associate with.
  - [ ] Set Priority to High.
- **Recurring Activity:**
  - [ ] Create a "Weekly Team Sync" activity.
  - [ ] Check **Recurring Activity**. Set to **Weekly**.
  - [ ] Verify the system creates multiple instances in the calendar.
- **Completion (Clearing):**
  - [ ] Open an activity -> Click **Complete Activity**.
  - [ ] Verify the **Clear Activity** modal appears.
  - [ ] Select a **Result** (e.g., "Left Message").
  - [ ] Enter **Outcome Notes**.
  - [ ] Toggle **Schedule Follow-up** ON.
  - [ ] Click **Clear & Follow-up**.
  - [ ] Verify a new **Create Activity** modal opens with pre-filled associations and "Follow-up" in the subject.
  - [ ] Verify the original activity is moved to the **History** tab of the contact/company.
- **Reminders:**
  - [ ] Schedule a task for 15 minutes from now.
  - [ ] Set "Reminder" to "15 minutes before".
  - [ ] Wait or adjust system time (dev) to verify a browser notification (Toast) appears.
- **Series Management:**
  - [ ] Create a recurring activity.
  - [ ] Open an instance and click **Delete Series**.
  - [ ] Verify ALL instances are removed from the calendar.

### 4.2 Calendar View
- **Interaction:**
  - [ ] Navigate to `/calendar`.
  - [ ] Verify the meeting created above appears on the correct day/time.
  - [ ] **Drag & Drop:** Drag the meeting to a different time slot. Verify the time updates in the activity details.

---

## 💼 Module 5: Opportunity Management (Sales)

### 5.1 Sales Pipeline (Kanban)
- **Board:**
  - [ ] Navigate to `/opportunities`.
  - [ ] Verify columns: Lead, Qualified, Proposal, Negotiation, Closed Won/Lost.
  - [ ] **Drag & Drop:** Move a deal from "Lead" to "Proposal".
  - [ ] **Closing:** Drag a deal to "Closed Won". Verify a confirmation modal (if applicable) or success toast.
- **Card Actions:**
  - [ ] Click a Deal Card -> Verify navigation to **Opportunity Details**.
  - [ ] Click the **Menu (...)** on a card -> Select **Clone**. Verify a copy is created.

### 5.2 Opportunity Details
- **Editing:**
  - [ ] Change "Expected Close Date" or "Probability".
  - [ ] Add a **Product** line item (if Products module is enabled).

---

## 🔍 Module 6: Advanced Lookup & Filtering

### 6.1 Multi-Criteria Search
- **Search Builder:**
  - [ ] Navigate to `/lookup`.
  - [ ] Entity: **Contacts**.
  - [ ] Add Criteria 1: `City` `Contains` `[Your City]`.
  - [ ] Add Criteria 2: `Email` `Contains` `@`.
  - [ ] Click **Search**. Verify accurate results.

### 6.2 Saved Searches
- **Saving:**
  - [ ] Click **Save This Search** icon. Name it "Local Contacts".
  - [ ] **Loading:** Refresh page. Select "Local Contacts" from the header dropdown. Verify criteria loads.

---

## ⚙️ Module 7: Settings & Admin
- **User Management:**
  - [ ] Go to User Management. Create a new user invite (if email server configured).
- **Custom Fields (if active):**
  - [ ] Go to Settings -> Custom Fields.
  - [ ] Add a text field "Loyalty Score" to Contacts.
  - [ ] Go to a Contact -> Edit. Verify "Loyalty Score" field is available.

---

## 🛑 Error Handling & Edge Cases
- [ ] Try creating a record without required fields (should show validation error).
- [ ] Try accessing a non-existent ID in URL (e.g., `/contacts/99999`) -> Should handle gracefully (404 Page or Error Toast).
- [ ] Test network failure (offline mode) if PWA features are active (optional).
