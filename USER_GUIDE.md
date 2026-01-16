# 📖 Act! CRM - Complete User Guide (v3.0)

## Welcome to Your Act! CRM System!

This comprehensive guide covers all features implemented in your CRM system (Weeks 1-10).

**Version**: 3.0 (Weeks 1-10 Complete)  
**Last Updated**: January 14, 2026  
**Total Features**: 75+

---

## 📑 Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard & Widgets](#dashboard--widgets)
3. [Contact Management](#contact-management)
4. [Activities & Schedule](#activities--schedule)
5. [Advanced Search](#advanced-search)
6. [Saved Views](#saved-views)
7. [Bulk Operations](#bulk-operations)
8. [Quick Actions](#quick-actions)
9. [Column Customization](#column-customization)
10. [Contact Tabs](#contact-tabs)
11. [Tips & Tricks](#tips--tricks)

---

## 🚀 **Getting Started**

### **Accessing the Application**

1. **Start the Application**:
   ```
   Frontend: http://localhost:5173
   API: http://localhost:5000
   ```

2. **Login** (if required):
   - Navigate to login page
   - Enter credentials
   - Click "Sign In"

3. **Dashboard**:
   - After login, you'll see the main dashboard
   - Dashboard now features **6 interactive widgets**
   - Left sidebar contains all navigation

---

## 📊 **Dashboard & Widgets** (NEW in v3.0!)

### **Dashboard Overview**

The dashboard is your command center with real-time insights:

#### **Top Stats Row**
- **Total Contacts** - Lifetime count
- **Open Opportunities** - Active pipeline
- **Potential Value** - Weighted pipeline value
- **Win Rate** - Closed/Won ratio

### **Dashboard Widgets**

#### **1. Activity Summary Widget**
Shows your activity statistics at a glance:
- Total Activities
- Completed count
- Pending count
- Overdue count

#### **2. Quick Actions Widget** ⭐
Create records instantly without navigating:
- **New Contact** - Add a contact
- **New Company** - Add a company
- **New Opportunity** - Create opportunity
- **New Activity** - Schedule activity

#### **3. Upcoming Activities Widget**
Your next 5 scheduled tasks:
- Shows activity subject
- Date and time
- Associated contact
- Activity type icon

#### **4. Recent Contacts Widget**
5 most recently updated contacts:
- Avatar with initials
- Name and email
- Click to navigate
- "View All Contacts" button

#### **5. Sales Funnel**
Visual pipeline breakdown:
- Progress bars by stage
- Percentage at each stage
- Color-coded stages

#### **6. Recent Activity Feed**
Latest activity history:
- Activity title
- Date completed
- Activity type

---

## 👥 **Contact Management**

### **Viewing Contacts**

1. Click **"CONTACTS"** in the left sidebar
2. See all contacts in a list
3. Use filters and search to find specific contacts

### **Creating a New Contact**

1. Go to Contacts page
2. Click **"Create new"** button (top right)
3. Fill in the form:
   - **First Name** (Required)
   - **Last Name** (Required)
   - **Email** (Required)
   - **Salutation** (Mr., Ms., Dr., Prof.)
   - **Department**
   - **Job Title**
   - **Office Phone** + Extension
   - **Mobile Phone**
   - **Fax**
   - **Status** (Active, Prospect, Customer, Vendor, Lead)
   - **Address** fields
4. Click **"Create Record"**

### **Viewing Contact Details**

1. Click on any contact from the list
2. Contact Detail Page shows:
   - **Header**: Avatar, Name with Salutation, Job Title, Department
   - **Contact Info**: Email, Phones, Address
   - **10 TABS**: History, Notes, Activities, Opportunities, Documents, Groups, Companies, Personal Info, Web Info, Custom Fields

### **Editing a Contact**

1. Open contact detail page
2. Click **"Edit Record"** button
3. Update any fields
4. Click **"Save Changes"**

---

## 📅 **Activities & Schedule**

### **Accessing Activities**

1. Click **"SCHEDULE"** in the left sidebar
2. Main Activities page opens

### **View Modes**

Choose from 3 different views:

#### **1. List View** (Table)
- Click **"LIST"** button
- Table with all activity details
- Checkboxes for bulk selection
- Sortable columns

#### **2. Week View** (Calendar)
- Click **"WEEK"** button
- 7-day calendar grid
- 24-hour time slots
- Click time slot to create activity
- Navigation: Previous/Next/Today

#### **3. Day View** (Detailed)
- Click **"DAY"** button
- Single day hourly breakdown
- Large activity cards
- Current hour highlighted

### **Creating Activities**

#### **Method 1: Using Templates** ⭐ Recommended

1. Click **"Templates"** button
2. Choose from 6 templates:
   - Follow-up Call (15 min)
   - Client Meeting (60 min)
   - Send Proposal (30 min)
   - Send Follow-up Email (10 min)
   - Quarterly Business Review (90 min)
   - Discovery Call (30 min)
3. **Form auto-fills** with template data! ✅
4. Adjust fields as needed
5. Save

#### **Method 2: Manual Entry**

1. Click **"New Activity"** button
2. Fill in:
   - **Subject** (Required)
   - **Type** - 9 types (Call, Meeting, To-Do, Email, Event, Letter, Video Call, Lunch, Chat)
   - **Priority** - Low/Medium/High
   - **Start Time**
   - **Duration** - 10min to 2 hours
   - **Location** (Optional)
   - **Description** (Optional)
   - **Contact ID** (Optional)
3. Save

### **Creating Recurring Activities**

1. Click **"Recurring"** button
2. **Configure Pattern**:
   - **Frequency**: Daily, Weekly, Monthly, Yearly
   - **Interval**: Every 1, 2, 3... periods
   - **Details**:
     - Weekly: Select days (Sun-Sat)
     - Monthly: Select day of month
   - **End Condition**: Never / On Date / After X times
3. **Save Recurrence**

**Example Patterns**:
- **Weekly standup**: Weekly, Mon-Fri, Never
- **Monthly review**: Monthly, Day 1, Never
- **Quarterly meeting**: Monthly, Interval 3, After 4 times

---

## 🔍 **Advanced Search** (NEW!)

### **Opening Advanced Search**

1. Click **Search** icon in header
2. Full-screen search panel opens

### **Using Advanced Search**

1. **Enter search query** in the search box
2. **Select search scope**:
   - ☑️ Contacts
   - ☑️ Companies
   - ☑️ Activities
   - ☑️ Opportunities
3. **Click "Search"** or press Enter
4. Results appear from all selected scopes

### **Search Tips**

- **Multiple scopes**: Check multiple types to search everywhere
- **Keyboard**: Press ESC to close search panel
- **Fast search**: Type and press Enter

---

## 👁️ **Saved Views** (NEW!)

### **What are Saved Views?**

Saved Views let you save your current filters and sorting as a custom view you can reuse later.

### **Saving a View**

1. Apply filters and sorting to your list
2. Click **"Save Current View"** button
3. Enter a **View Name** (e.g., "My Active Leads")
4. ☑️ Check **"Set as default view"** (optional)
5. Click **"Save View"**

### **Using Saved Views**

1. Go to Saved Views panel
2. **Click on any view** to apply it
3. Your filters and sorting are restored
4. **Star icon** = Default view (loads on page open)

### **Managing Views**

- **Apply View**: Click view name
- **Set Default**: Click star icon
- **Delete View**: Click trash icon (appears on hover)

### 3. Managing Contacts
- **View Contacts**: Navigate to the "Contacts" page to see a list of all contacts.
- **Advanced Search**: Click "Advanced Search" at the top to filter across Contacts, Companies, and Activities.
- **Saved Views**: Use the "Saved Views" dropdown to save your filter configurations for quick access later.
- **Customize Columns**: Click "Columns" to toggle and reorder the table columns to your liking.
- **Add Contact**: Click "New Contact", fill in the details, and click "Save".
- **Edit Contact**: Click on a contact to view details, then click the "Edit" button.
- **Bulk Actions**: Select multiple contacts using the checkboxes to Delete or perform other bulk operations.

---

## ⚡ **Bulk Operations** (NEW!)

### **Selecting Multiple Items**

1. In **List View**, check boxes next to items
2. Or check header checkbox to select all
3. **Bulk Actions Toolbar** appears at bottom

### **Available Bulk Actions**

**For Contacts**:
- 📧 **Send Email** - Email all selected contacts
- 🏷️ **Add Tag** - Tag multiple contacts
- 📦 **Archive** - Archive contacts
- 🗑️ **Delete** - Delete selected

**For Activities**:
- ✅ **Mark Complete** - Complete all selected
- 👥 **Assign** - Assign to user
- 📦 **Archive** - Archive activities
- 🗑️ **Delete** - Delete selected

### **Using Bulk Actions**

1. **Select items** (checkboxes)
2. **Click action button** from toolbar
3. **Confirm** action
4. Changes applied to all selected items

---

## ⚡ **Quick Actions** (NEW!)

### **What are Quick Actions?**

Quick Actions appear on contact detail pages and provide fast access to common tasks.

### **Available Quick Actions**

1. **📞 Schedule Call** - Create a call activity
2. **📅 Schedule Meeting** - Create a meeting
3. **✉️ Send Email** - Open email composer
4. **📝 Add Note** - Create a note
5. **💬 Send SMS** - Send text message
6. **🎥 Video Call** - Start video call
7. **📍 View on Map** - See address on map

### **Using Quick Actions**

1. Open a contact detail page
2. **Quick Actions panel** on the right
3. **Click any action**
4. Corresponding form/app opens

---

## 📈 **Latest Activities Widget** (NEW in v3.0!)

### **What is the Latest Activities Widget?**

This widget appears on every contact detail page showing activity counts for that specific contact.

### **Widget Features**

Displays counts for:
- 📧 **Emails** - Email activities
- 📞 **Call Attempts** - Uncompleted calls
- ✅ **Calls Reached** - Completed calls
- 📅 **Meetings** - Meeting activities
- 📄 **Letters** - Letter activities

### **Interactive Filtering** ⭐

1. **Click any activity count** in the widget
2. **Activities tab opens automatically**
3. **Filter is applied** showing only that type
4. **Filter indicator** shows active filter
5. **"Clear Filter"** button to see all

### **Example Workflow**

1. Viewing John Doe's contact page
2. Widget shows "5 Meetings"
3. Click "5 Meetings"
4. Activities tab opens
5. Shows only Meeting activities
6. Click "Clear Filter" to see all

---

## 🎛️ **Column Customization** (NEW!)

### **Customizing Columns**

1. In any **List View**, click **"Customize"** button
2. **Column Customizer** panel opens

### **Reordering Columns**

1. **Drag** columns up/down using the grip handle
2. Columns reorder in real-time
3. Click **"Apply Changes"**

### **Show/Hide Columns**

1. Click **eye icon** next to any column
2. 👁️ = Visible
3. 👁️‍🗨️ = Hidden
4. Click **"Apply Changes"**

### **Resetting Columns**

1. Click **"Reset to Default"**
2. All columns restored to original order
3. All columns made visible

---

## 📑 **Contact Tabs** (NEW!)

### **Available Tabs**

Every contact has **10 tabs** with different information:

1. **History** - Activity timeline
2. **Notes** - Contact notes
3. **Activities** - Scheduled activities
4. **Opportunities** - Sales opportunities
5. **Documents** - Attached files
6. **Groups** ⭐ NEW
7. **Companies** ⭐ NEW
8. **Personal Info** ⭐ NEW
9. **Web Info** ⭐ NEW
10. **Custom Fields** ⭐ NEW

---

### **📁 Groups Tab** (NEW!)

**Purpose**: Manage contact's group memberships

#### **Viewing Groups**

1. Open contact detail page
2. Click **"Groups"** tab
3. See all groups contact belongs to

#### **Adding to a Group**

1. Click **"Add to Group"** button
2. Select group from list
3. Contact added to group

#### **Creating a Group**

1. Click **"Create Group"** button
2. Enter **Group Name**
3. Enter **Description** (optional)
4. Click **"Create & Add Contact"**
5. New group created, contact added

#### **Removing from Group**

1. Hover over group card
2. Click **trash icon**
3. Contact removed from group

**Group Statistics**:
- Total Groups
- Total Connections (all group members)
- Categories

---

### **🏢 Companies Tab** (NEW!)

**Purpose**: Link contacts to companies

#### **Primary vs Secondary Companies**

- **Primary Company**: Main company (highlighted with gradient)
- **Secondary Companies**: Other associated companies
- Each has a **relationship type**: Primary, Secondary, Vendor, Partner

#### **Linking a Company**

1. Click **"Link Company"** button
2. Select company
3. Choose **relationship type**
4. Click **"Link"**

#### **Setting Primary Company**

1. Find company in secondary list
2. Hover over company card
3. Click **"Set Primary"** button
4. Company becomes primary

#### **Unlinking a Company**

1. Hover over company card
2. Click **trash icon**
3. Company unlinked

**Company Info Displayed**:
- Company name
- Industry
- Website (clickable)
- Phone
- Address

---

### **👤 Personal Info Tab** (NEW!)

**Purpose**: Store personal details about the contact

#### **Information Categories**

**1. Important Dates**
- 🎂 **Date of Birth**
- ❤️ **Anniversary**

**2. Family**
- **Spouse** name
- **Children** names/ages

**3. Professional**
- **Education** background

**4. Personal Details**
- **Hobbies & Interests**
- **Achievements**
- **Personal Notes**

**5. Social Media**
- LinkedIn profile
- Twitter handle

#### **Editing Personal Info**

1. Click **"Edit"** button
2. All fields become editable
3. Fill in/update information
4. Click **"Save"** or **"Cancel"**

**Privacy Note**: This information is private and should be used appropriately.

---

### **🌐 Web Info Tab** (NEW!)

**Purpose**: Manage contact's web presence

#### **Primary Websites**

Three main website fields:
- **Website** - Main personal/business site
- **Blog** - Blog URL
- **Portfolio** - Portfolio site

All display as **clickable links** with external link icon.

#### **Custom Links**

Add unlimited custom web links!

**Adding a Custom Link**:
1. Click **"Edit"** button
2. Fill in:
   - **Label** (e.g., "GitHub")
   - **URL** (https://github.com/username)
   - **Type** (Business/Personal/Social/Other)
3. Click **"Add Link"**

**Link Types**:
- 💼 **Business** (blue)
- 💖 **Personal** (pink)
- 🟣 **Social** (purple)
- ⚪ **Other** (gray)

**Deleting Links**:
1. Click **"Edit"** button
2. Hover over link
3. Click **X icon**

---

### **⚙️ Custom Fields Tab** (NEW!)

**Purpose**: Create your own custom fields to track any data

#### **Creating a Custom Field**

1. Click **"Add Field"** button
2. Enter **Field Label** (e.g., "Customer ID")
3. Select **Field Type**:
   - 📝 **Text** - Any text
   - 🔢 **Number** - Numeric values
   - 📅 **Date** - Date picker
   - ☑️ **Checkbox** - Yes/No toggle
4. Click **"Add Field"**

#### **Editing Field Values**

1. Fields appear as form inputs
2. Enter/update values
3. Click **"Save All"**

#### **Deleting Fields**

1. Hover over field card
2. Click **trash icon**
3. Field deleted

**Use Cases**:
- Customer ID or Account Number
- Contract Renewal Date
- VIP Status (checkbox)
- Loyalty Points (number)
- Any business-specific data!

---

## 🎯 **Quick Tips**

### **Keyboard Shortcuts**
- **ESC** - Close modals/panels
- **Enter** - Submit forms
- **Arrow Keys** - Navigate calendar

### **Best Practices**

#### **For Contacts**:
- Always set a **Status**
- Use **Department** for organization
- Include **Phone Extension** for office numbers
- Fill in **Personal Info** for better relationships
- Link to **Primary Company**
- Add to relevant **Groups**

#### **For Activities**:
- Use **Templates** for speed
- Set appropriate **Priority**
- Choose correct **Duration**
- Add **Location** for meetings
- Use **Description** for agenda/notes
- Link to **Contact** for context

#### **For Organization**:
- Create **Saved Views** for different filters
- Use **Groups** to organize contacts
- Add **Custom Fields** for business-specific needs
- Keep **Web Info** updated
- Use **Bulk Operations** for efficiency

### **Navigation Tips**

- **Sidebar** always visible
- **Breadcrumbs** show location
- **Search** finds anything
- **Quick Actions** save time

---

## 🔧 **Troubleshooting**

### **Template Not Pre-filling?**
- Make sure you're on `/schedule` page
- Click "Templates" button first
- Then click a template
- Modal opens with data filled

### **Bulk Actions Not Showing?**
- Make sure you're in **List View**
- Select at least 1 item (checkbox)
- Toolbar appears at bottom of screen

### **Can't Edit Personal Info?**
- Click **"Edit"** button first
- Make changes
- Click **"Save"** to apply

### **Custom Fields Not Saving?**
- Click **"Save All"** button
- Don't navigate away before saving

### **Saved View Not Loading?**
- Click on the view name
- Or set it as default (star icon)
- Refresh page if needed

---

## 💡 **Common Workflows**

### **Workflow 1: Add New Contact with Full Info**

1. **Create Contact**:
   - Go to Contacts
   - Click "Create new"
   - Fill basic info (name, email, phone)
   - Set Status to "Prospect"
   - Save

2. **Add Personal Details**:
   - Open contact
   - Go to "Personal Info" tab
   - Add birthday, spouse, hobbies
   - Save

3. **Link to Company**:
   - Go to "Companies" tab
   - Click "Link Company"
   - Select company, set as Primary
   - Save

4. **Add to Groups**:
   - Go to "Groups" tab
   - Click "Add to Group"
   - Select "VIP Customers"
   - Contact added

5. **Schedule Follow-up**:
   - Use Quick Actions
   - Click "Schedule Call"
   - Set for tomorrow
   - Save

### **Workflow 2: Bulk Email Campaign**

1. **Filter Contacts**:
   - Go to Contacts
   - Apply filters (Status = "Active")
   - Save as view "Active Customers"

2. **Select Recipients**:
   - Check boxes for contacts
   - Or check "Select All"

3. **Send Bulk Email**:
   - Bulk toolbar appears
   - Click "Email" button
   - Compose message
   - Send to all

### **Workflow 3: Customize Your View**

1. **Customize Columns**:
   - Go to Contacts list
   - Click "Customize"
   - Hide unnecessary columns
   - Reorder important ones
   - Apply changes

2. **Apply Filters**:
   - Filter by Status, Department
   - Sort by Last Name

3. **Save View**:
   - Click "Save Current View"
   - Name it "Sales Team Contacts"
   - Set as default
   - Save

4. **Use View**:
   - View loads automatically
   - Or click view name anytime

---

## 📊 **Understanding the Interface**

### **Color Coding**

#### **Status Badges**
- **Green** (Emerald) - Active
- **Blue** - Prospect  
- **Indigo** - Customer
- **Purple** - Vendor
- **Yellow** - Lead
- **Red** - Unqualified

#### **Priority Badges**
- **Red** - High priority
- **Orange** - Medium priority
- **Green** - Low priority

#### **Activity Types**
- **Blue** - Call
- **Purple** - Meeting
- **Green** - To-Do
- **Indigo** - Email
- **Orange** - Event
- **Gray** - Letter
- **Cyan** - Video Call
- **Amber** - Lunch
- **Pink** - Chat

### **Icons Reference**

- 📧 Email
- 📞 Phone/Call
- 👥 Meeting/Group
- ✅ To-Do/Complete
- 📅 Calendar/Date
- 📄 Document
- 🏢 Company
- 📍 Location/Map
- 🔁 Recurring
- 🔍 Search
- 👁️ View
- ⚙️ Settings
- 🏷️ Tag
- 📦 Archive
- 🗑️ Delete

---

## 📱 **Mobile Usage**

All features work on mobile:

- **Responsive Design** - Adapts to screen
- **Touch Friendly** - Large tap targets
- **Swipe** - Navigate calendars
- **Mobile Forms** - Stack vertically
- **Quick Actions** - Easy access

---

## 🎓 **Training Checklist**

### **Basic Skills** ✅
- [ ] Navigate using sidebar
- [ ] Create a contact
- [ ] Edit a contact
- [ ] View contact details
- [ ] Create an activity
- [ ] Use templates
- [ ] View calendar (Week/Day)

### **Intermediate Skills** 🔄
- [ ] Use advanced search
- [ ] Create saved views
- [ ] Apply filters
- [ ] Use bulk operations
- [ ] Customize columns
- [ ] Add personal info
- [ ] Link companies
- [ ] Add to groups

### **Advanced Skills** ⭐
- [ ] Create recurring activities
- [ ] Manage custom fields
- [ ] Use quick actions
- [ ] Bulk email campaigns
- [ ] Advanced filtering
- [ ] Custom views workflow
- [ ] Web info management

---

## 🆕 **What's New in v2.0**

### **Week 5-6 Features**
✅ Advanced Search (multi-scope)  
✅ Saved Views Manager  
✅ Bulk Operations Toolbar  
✅ Quick Actions Menu  
✅ Column Customizer  

### **Week 7-8 Features**
✅ Groups Tab  
✅ Companies Tab  
✅ Personal Info Tab  
✅ Web Info Tab  
✅ Custom Fields Tab  

### **Week 9-10 Features** (NEW!)
✅ Dashboard Redesign with 6 Widgets  
✅ Activity Summary Widget  
✅ Quick Actions Widget  
✅ Upcoming Activities Widget  
✅ Recent Contacts Widget  
✅ Latest Activities Widget on Contact Detail  
✅ Activity Type Filtering  
✅ Backend Activity Statistics Endpoints  

**Total New Components**: 16  
**Total New Features**: 45+

---

## 📞 **Support**

### **Getting Help**

- Check this user guide first
- Review component-specific docs
- Test in demo page: `/activity-demo`
- Contact system administrator

### **Documentation Files**

- `USER_GUIDE.md` - This guide
- `WEEK_1-2_IMPLEMENTATION_COMPLETE.md`
- `WEEK_3-4_IMPLEMENTATION_COMPLETE.md`
- `WEEK_5-6_IMPLEMENTATION_COMPLETE.md`
- `WEEK_7-8_IMPLEMENTATION_COMPLETE.md`
- `WHERE_ARE_THE_FEATURES.md`
- `HOW_TO_TEST_RECURRING_ACTIVITIES.md`

---

## ✅ **Version Information**

**Current Version**: 2.0 (Week 1-8 Implementation)  
**Release Date**: January 2026  
**Total Features**: 60+  
**Total Components**: 22  
**Status**: Fully Functional  

**Implemented Modules**:
- ✅ Contact Management (Week 1-2)
- ✅ Activities & Calendar (Week 3-4)
- ✅ Navigation & Views (Week 5-6)
- ✅ New Contact Tabs (Week 7-8)
- ✅ Dashboard & Widgets (Week 9-10)

**Coming Soon**:
- Email Integration (Week 11-12)
- Sales Pipeline Enhancement (Week 13-14)
- Import/Export Tools (Week 15-16)
- Reporting & Analytics (Week 17-18)

---

## 🎉 **Congratulations!**

You're now ready to use your Act! CRM system like a pro!

**Quick Start Checklist**:
1. ✅ Explore the new dashboard widgets
2. ✅ Create your first contact
3. ✅ Add personal info
4. ✅ Link to a company
5. ✅ Add to a group
6. ✅ Schedule an activity using a template
7. ✅ Check Latest Activities Widget
8. ✅ Try activity type filtering
9. ✅ Use Quick Actions from dashboard
10. ✅ Create a saved view
11. ✅ Add custom fields
12. ✅ Explore all tabs!

**Happy CRM-ing!** 🚀

---

**Pro Tips** 💡:
- Use templates for speed
- Save views for efficiency
- Quick actions for convenience
- Custom fields for flexibility
- Bulk operations for scale

---

*Last Updated: January 14, 2026*  
*Version: 3.0 (Weeks 1-10 Complete)*  
*Total Pages Covered: Dashboard, Contact Management, Activities, Search, Views, Bulk Ops, Tabs, Widgets*  
*New in v3.0: Dashboard Widgets, Activity Summary, Quick Actions Widget, Latest Activities Widget, Activity Filtering*
