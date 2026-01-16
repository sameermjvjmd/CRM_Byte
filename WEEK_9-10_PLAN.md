# Week 9-10 Implementation Plan: Dashboard & Widgets
## Phase 5: Latest Activities Widget & Dashboard

### Overview
Enhance the dashboard with activity tracking widgets and improve the Contact Detail page with a Latest Activities summary widget showing activity counts by type.

---

## Backend Tasks

### 1. Create Activity Statistics Endpoints ✅
**File**: `CRM.Api/Controllers/ActivitiesController.cs`

Add endpoints:
- `GET /api/activities/stats` - Overall activity statistics
- `GET /api/activities/stats/by-contact/{contactId}` - Per-contact activity summary
- `GET /api/activities/counts-by-type` - Activity counts grouped by type

**Response Models**:
```csharp
public class ActivityStatsDto
{
    public int TotalActivities { get; set; }
    public int CompletedActivities { get; set; }
    public int PendingActivities { get; set; }
    public int OverdueActivities { get; set; }
    public Dictionary<string, int> CountsByType { get; set; }
}

public class ContactActivitySummaryDto
{
    public int ContactId { get; set; }
    public int TotalActivities { get; set; }
    public int EmailCount { get; set; }
    public int CallAttemptCount { get; set; }
    public int CallReachedCount { get; set; }
    public int MeetingCount { get; set; }
    public int LetterSentCount { get; set; }
    public DateTime? LastActivityDate { get; set; }
}
```

### 2. Dashboard Widget Configuration Table (Optional - Phase 2)
For now, we'll hardcode widget configs. Later add:
- `DashboardWidget` table
- User-specific widget preferences
- Widget positioning

---

## Frontend Tasks

### 1. Create Latest Activities Widget Component
**File**: `CRM.Web/src/components/LatestActivitiesWidget.tsx`

Features:
- Display activity counts by type with icons
- Show totals (Completed, Pending, Overdue)
- Make each count clickable to filter
- Show last activity date
- Responsive card design

### 2. Create Dashboard Widget Components
**File**: `CRM.Web/src/components/widgets/`

Widgets to create:
1. **ActivitySummaryWidget** - Quick stats
2. **RecentContactsWidget** - Last 5 contacts modified/created
3. **UpcomingActivitiesWidget** - Next 5 activities
4. **OpportunitiesPipelineWidget** - Mini pipeline view
5. **QuickActionsWidget** - Shortcuts to common tasks

### 3. Enhance Dashboard Page
**File**: `CRM.Web/src/pages/Dashboard.tsx`

Improvements:
- Grid layout for widgets (2x3 or 3x3)
- Responsive widget sizing
- Add new widgets
- Improve stats cards with trends

### 4. Integrate Widget into Contact Detail Page
**File**: `CRM.Web/src/pages/ContactDetailPage.tsx`

Add:
- Latest Activities widget in sidebar or top section
- Show activity counts for *this specific contact*
- Clickable counts filter Activities tab

---

## Implementation Order

1. **Backend** (30 min)
   - Add activity stats endpoints to `ActivitiesController`
   - Create DTOs

2. **Frontend - Widgets** (45 min)
   - Create `LatestActivitiesWidget.tsx`
   - Create dashboard widgets folder
   - Build 5 widget components

3. **Frontend - Integration** (30 min)
   - Update Dashboard page with new widgets
   - Add widget to ContactDetailPage
   - Wire up API calls

4. **Testing \u0026 Polish** (15 min)
   - Test filtering by clicking counts
   - Verify responsiveness
   - Add loading states

**Total Estimated Time**: 2 hours

---

## Success Criteria

- ✅ Dashboard shows 6+ informative widgets
- ✅ Contact Detail page has activity summary widget
- ✅ Activity counts are accurate and clickable
- ✅ Widgets are responsive and well-designed
- ✅ Data refreshes appropriately
- ✅ Loading states and error handling

---

## Next Steps After This
- Week 11-12: Email Integration
- Week 13-14: Sales Pipeline Enhancement
- Week 15-16: Import/Export Tools
