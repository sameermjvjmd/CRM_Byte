# 🚀 Multi-Feature Implementation Plan
## Four Major Features: Custom Fields, Opportunity Completion, Bulk Operations, Contact Enhancements

**Date:** January 23, 2026  
**Estimated Total Time:** 19-28 hours  
**Session Goal:** Complete all four high-priority features

---

## 📋 **FEATURE A: Custom Fields (User Fields)**
**Priority:** Foundation Feature  
**Estimated Time:** 6-8 hours  
**Status:** � Completed

### **Backend Tasks:**

#### 1. Database Schema (30 minutes)
```sql
-- CustomFieldDefinitions Table
CREATE TABLE CustomFieldDefinitions (
    Id INT PRIMARY KEY IDENTITY,
    TenantId INT NOT NULL,
    EntityType NVARCHAR(50) NOT NULL, -- 'Contact', 'Company', 'Opportunity'
    FieldName NVARCHAR(100) NOT NULL,
    FieldLabel NVARCHAR(200) NOT NULL,
    FieldType NVARCHAR(50) NOT NULL, -- 'Text', 'Number', 'Date', 'Dropdown', 'MultiSelect', 'YesNo', 'LongText'
    Options NVARCHAR(MAX), -- JSON array for dropdown/multiselect
    IsRequired BIT NOT NULL DEFAULT 0,
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedByUserId INT,
    FOREIGN KEY (TenantId) REFERENCES Tenants(Id),
    UNIQUE (TenantId, EntityType, FieldName)
);

-- CustomFieldValues Table
CREATE TABLE CustomFieldValues (
    Id INT PRIMARY KEY IDENTITY,
    TenantId INT NOT NULL,
    CustomFieldDefinitionId INT NOT NULL,
    EntityId INT NOT NULL, -- ID of the Contact/Company/Opportunity
    Value NVARCHAR(MAX), -- Stores all value types as string
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (TenantId) REFERENCES Tenants(Id),
    FOREIGN KEY (CustomFieldDefinitionId) REFERENCES CustomFieldDefinitions(Id) ON DELETE CASCADE,
    UNIQUE (CustomFieldDefinitionId, EntityId)
);

CREATE INDEX IX_CustomFieldValues_Entity ON CustomFieldValues(TenantId, EntityId);
CREATE INDEX IX_CustomFieldDefinitions_Entity ON CustomFieldDefinitions(TenantId, EntityType, IsActive);
```

#### 2. Models (30 minutes)
- `CRM.Api/Models/CustomFieldDefinition.cs`
- `CRM.Api/Models/CustomFieldValue.cs`
- `CRM.Api/DTOs/CustomFieldDefinitionDto.cs`
- `CRM.Api/DTOs/CustomFieldValueDto.cs`

#### 3. API Controller (2 hours)
**`CRM.Api/Controllers/CustomFieldsController.cs`**

Endpoints:
- `GET /api/customfields/definitions` - Get all definitions (filter by entityType)
- `GET /api/customfields/definitions/{id}` - Get specific definition
- `POST /api/customfields/definitions` - Create new field definition
- `PUT /api/customfields/definitions/{id}` - Update definition
- `DELETE /api/customfields/definitions/{id}` - Delete definition (and all values)
- `POST /api/customfields/definitions/reorder` - Reorder fields
- `GET /api/customfields/values/{entityType}/{entityId}` - Get all values for an entity
- `POST /api/customfields/values` - Save/update field value
- `DELETE /api/customfields/values/{id}` - Delete field value

#### 4. Service Layer (1 hour)
- Validation logic for field types
- JSON serialization for dropdown options
- Type conversion for values
- Default value handling

### **Frontend Tasks:**

#### 5. Admin Page - Field Management (2-3 hours)
**`CRM.Web/src/pages/admin/CustomFieldsPage.tsx`**

**Features:**
- List all custom field definitions grouped by entity type
- Tabs: Contacts | Companies | Opportunities
- Create/Edit modal with:
  - Field Label
  - Field Type dropdown (Text, Number, Date, Dropdown, Multi-Select, Yes/No, Long Text)
  - Options editor (for Dropdown/Multi-Select)
  - Required checkbox
  - Active/Inactive toggle
- Drag-and-drop reordering
- Delete with confirmation
- Preview panel showing how field will appear

#### 6. Dynamic Field Renderer Component (1 hour)
**`CRM.Web/src/components/CustomFieldRenderer.tsx`**

Renders custom fields based on type:
- Text → `<input type="text">`
- Number → `<input type="number">`
- Date → `<input type="date">`
- Dropdown → `<select>`
- Multi-Select → `<select multiple>` or checkboxes
- Yes/No → Toggle switch
- Long Text → `<textarea>`

#### 7. Integration into Detail Pages (2 hours)
- **ContactDetailPage:** Add "Custom Fields" section or tab
- **CompanyDetailPage:** Add "Custom Fields" section or tab
- **OpportunityDetailPage:** Add "Custom Fields" section or tab
- Load definitions and values
- Display in read-only mode by default
- Edit mode with validation
- Save values on update

---

## 📋 **FEATURE B: Opportunity/Pipeline Completion**
**Priority:** Complete Major Module  
**Estimated Time:** 5-8 hours  
**Status:** 🔴 Not Started

### **Phase 3: Competitors UI (1 hour)**

#### Backend:
```sql
CREATE TABLE OpportunityCompetitors (
    Id INT PRIMARY KEY IDENTITY,
    TenantId INT NOT NULL,
    OpportunityId INT NOT NULL,
    CompetitorName NVARCHAR(200) NOT NULL,
    Strengths NVARCHAR(MAX),
    Weaknesses NVARCHAR(MAX),
    Status NVARCHAR(50), -- 'Active', 'Eliminated', 'Won'
    Probability INT, -- Likelihood they'll win (0-100)
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (TenantId) REFERENCES Tenants(Id),
    FOREIGN KEY (OpportunityId) REFERENCES Opportunities(Id) ON DELETE CASCADE
);
```

#### Frontend:
- Add "Competitors" tab to OpportunityDetailPage
- List of competitors with SWOT summary
- Add/Edit/Delete competitors
- Competitive positioning matrix

### **Phase 4: Win/Loss Analysis Reports (2-3 hours)**

#### Backend:
- Enhance OpportunitiesController with win/loss endpoints
- `GET /api/opportunities/analytics/win-loss-summary`
- `GET /api/opportunities/analytics/win-loss-by-reason`
- `GET /api/opportunities/analytics/win-loss-trends`

#### Frontend:
- **Win/Loss Analysis Page** (`ReportsPage` new tab)
- Charts:
  - Win rate by stage
  - Loss reasons breakdown (pie chart)
  - Win/loss trends over time (line chart)
  - Average deal size: Won vs Lost
  - Time to close: Won vs Lost
- Filters: Date range, sales rep, product, stage

### **Phase 5: Deal Velocity Metrics (1-2 hours)**

#### Backend:
- Calculate average time in each stage
- Calculate average time from creation to close
- Stage bottleneck identification

#### Frontend:
- Add to Pipeline Analytics page
- Velocity metrics card:
  - Average sales cycle length
  - Fastest deal closed
  - Slowest moving deals
  - Stage velocity chart (days per stage)

### **Phase 6: Sales Leaderboard (1-2 hours)**

#### Backend:
- `GET /api/opportunities/leaderboard`
- Metrics per sales rep:
  - Total pipeline value
  - Won deals count
  - Won revenue
  - Win rate %
  - Average deal size

#### Frontend:
- Sales Leaderboard widget on Dashboard
- Full leaderboard page with:
  - Top performers
  - Activity metrics
  - Revenue achievements
  - Filter by: This Month, This Quarter, This Year, All Time

---

## 📋 **FEATURE C: Bulk Operations**
**Priority:** User Productivity  
**Estimated Time:** 4-6 hours  
**Status:** 🔴 Not Started

### **Backend Tasks (2 hours):**

#### 1. Bulk API Endpoints
**ContactsController additions:**
- `POST /api/contacts/bulk-update` - Update multiple contacts
- `POST /api/contacts/bulk-delete` - Delete multiple contacts
- `POST /api/contacts/bulk-assign` - Assign owner to multiple contacts
- `POST /api/contacts/bulk-add-to-group` - Add to group
- `POST /api/contacts/bulk-tag` - Add/remove tags

**CompaniesController additions:**
- `POST /api/companies/bulk-update`
- `POST /api/companies/bulk-delete`
- `POST /api/companies/bulk-assign`

**GroupsController additions:**
- `POST /api/groups/{id}/bulk-add-members` - Already exists ✅
- `POST /api/groups/{id}/bulk-remove-members` - Add this
- `POST /api/groups/bulk-delete-groups`

#### 2. Batch Processing Service
- Transaction handling for bulk operations
- Error handling (partial success)
- Progress tracking
- Rollback on failure

### **Frontend Tasks (2-4 hours):**

#### 1. Multi-Select Component (1 hour)
- Checkbox selection in list views
- "Select All" / "Clear All" buttons
- Selection count indicator
- Bulk action toolbar (appears when items selected)

#### 2. Bulk Action Modals (1-2 hours)
- **Bulk Edit Modal:**
  - Select fields to update
  - Set new values
  - Preview affected records
  - Confirm and execute
- **Bulk Delete Modal:**
  - Warning message
  - List of items to delete
  - Confirmation
- **Bulk Assign Modal:**
  - Select new owner from user dropdown
  - Confirm assignment
- **Bulk Add to Group Modal:**
  - Select target group
  - Confirm addition

#### 3. Integration (1 hour)
- Add multi-select to:
  - ContactsPage
  - CompaniesPage
  - GroupsPage
- Bulk action toolbar
- Success/error notifications

---

## 📋 **FEATURE D: Contact/Company Enhancements**
**Priority:** Polish & UX  
**Estimated Time:** 4-6 hours  
**Status:** ✅ Completed

### **Enhancement 1: List/Detail View Toggle (1 hour)**

#### Frontend:
- Add view toggle button to ContactsPage and CompaniesPage
- **List View:** Current table/grid view
- **Detail View:** Card-based view with more info visible
  - Contact photo
  - Primary info (name, email, phone, company)
  - Latest activity
  - Next scheduled activity
  - Tags
  - Quick actions
- Save user preference in localStorage
- Responsive layout

### **Enhancement 2: Related Contacts Section (1 hour)**

#### Backend:
- `GET /api/contacts/{id}/related` - Find related contacts
- Logic:
  - Same company
  - Same groups
  - Referenced in notes/activities
  - Similar tags

#### Frontend:
- Add "Related Contacts" section to ContactDetailPage
- Show:
  - Contacts from same company
  - Contacts in shared groups
  - Suggested connections
- Click to navigate

### **Enhancement 3: Quick Call Logging (1 hour)**

#### Backend:
- `POST /api/activities/quick-call` - Create call activity with minimal info

#### Frontend:
- "Log Call" quick action button
- Modal with:
  - Call type dropdown (Reached, Left Message, Attempt, Follow-up)
  - Duration
  - Outcome/Notes
  - Auto-link to current contact
  - Schedule follow-up checkbox
- One-click save

### **Enhancement 4: Groups/Companies Tab Improvement (1-2 hours)**

#### Frontend - ContactDetailPage:
- **Groups Tab:**
  - Show all groups contact belongs to
  - Add to group button (with autocomplete)
  - Remove from group (with confirmation)
  - Group activity summary
- **Companies Tab:**
  - Show primary company (if linked)
  - Show company details inline
  - Edit company link
  - Navigate to company

#### Frontend - CompanyDetailPage:
- **Contacts Tab:**
  - Enhanced table with more details
  - Add contact button
  - Contact role/title inline editing
  - Primary contact indicator
  - Filter by role/department

---

## 🎯 **Implementation Strategy**

### **Session 1: Custom Fields (6-8 hours)**
1. Create database migration
2. Create models and DTOs
3. Build CustomFieldsController
4. Build CustomFieldsPage (admin)
5. Create CustomFieldRenderer component
6. Integrate into Contact/Company/Opportunity detail pages
7. Test all field types
8. Update master plan

### **Session 2: Contact/Company Enhancements (4-6 hours)**
1. Implement list/detail view toggle
2. Add related contacts logic
3. Build quick call logging
4. Enhance Groups/Companies tabs
5. Test all enhancements
6. Update master plan

### **Session 3: Bulk Operations (4-6 hours)**
1. Create bulk API endpoints
2. Build multi-select component
3. Create bulk action modals
4. Integrate into list pages
5. Test bulk operations
6. Update master plan

### **Session 4: Opportunity Pipeline Completion (5-8 hours)**
1. Build competitors UI (Phase 3)
2. Create win/loss analysis reports (Phase 4)
3. Add deal velocity metrics (Phase 5)
4. Build sales leaderboard (Phase 6)
5. Test all phases
6. Update master plan

---

## ✅ **Success Criteria**

### **Custom Fields:**
- [ ] Can create custom fields for Contacts, Companies, Opportunities
- [ ] All field types render correctly (Text, Number, Date, Dropdown, etc.)
- [ ] Fields appear on detail pages
- [ ] Values save and load correctly
- [ ] Field reordering works
- [ ] Validation works for required fields

### **Opportunity Completion:**
- [ ] Can track competitors
- [ ] Win/loss reports display correctly
- [ ] Deal velocity metrics calculated accurately
- [ ] Sales leaderboard shows top performers
- [ ] All charts render with real data

### **Bulk Operations:**
- [ ] Can select multiple items
- [ ] Bulk edit updates all selected items
- [ ] Bulk delete removes all selected items
- [ ] Bulk assign changes ownership
- [ ] Partial success handled gracefully

### **Contact/Company Enhancements:**
- [ ] View toggle switches between list/detail views
- [ ] Related contacts display correctly
- [ ] Quick call logging creates activities
- [ ] Groups/Companies tabs show enhanced data
- [ ] All navigation works

---

## 📊 **Progress Tracking**

| Feature | Status | Completion % | Time Spent | Notes |
|---------|--------|--------------|------------|-------|
| Custom Fields | � Completed | 100% | ~4h | Fully integrated with Admin & Details |
| Contact Enhancements | � In Progress | 0% | 0h | Started List/Detail logic |
| Bulk Operations | 🔴 Not Started | 0% | 0h | High productivity impact |
| Opportunity Completion | 🔴 Not Started | 0% | 0h | Final polish |

---

## 🚀 **Let's Begin!**

**Starting with:** Feature D - Contact/Company Enhancements
**Estimated Time:** 4-6 hours
**First Task:** Implement List/Detail View Toggle on ContactsPage

---

*Created: January 23, 2026*  
*Agent: Antigravity*  
*Session: Multi-Feature Implementation*
