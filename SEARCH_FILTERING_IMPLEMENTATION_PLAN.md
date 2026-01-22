# 🔍 Search & Filtering Module - Implementation Plan

**Priority**: HIGH  
**Estimated Time**: 8 hours  
**Current Status**: 25% → Target: 100%  
**Date**: January 22, 2026

---

## 📋 **Module Overview**

### **Goal**
Implement comprehensive search and filtering capabilities across all CRM entities (Contacts, Companies, Opportunities, Activities) with advanced query builder, saved searches, and global search.

### **Current State** (25%)
- ✅ Basic search exists in some pages
- ✅ Simple filtering on list pages
- ❌ No advanced query builder
- ❌ No saved searches
- ❌ No global search
- ❌ No filter presets

---

## 🎯 **Features to Implement**

### **Phase 1: Advanced Query Builder** (3 hours)
**Priority**: HIGH

**Features**:
1. **Visual Query Builder Component**
   - Add/remove filter conditions
   - Field selection dropdown
   - Operator selection (equals, contains, greater than, etc.)
   - Value input (text, number, date, dropdown)
   - AND/OR logic groups
   - Nested conditions support

2. **Supported Fields**:
   - **Contacts**: Name, Email, Phone, Company, Status, Lead Score, Source, Territory, Tags
   - **Companies**: Name, Industry, Revenue, Employee Count, Status
   - **Opportunities**: Name, Amount, Stage, Probability, Owner, Expected Close Date
   - **Activities**: Subject, Type, Status, Priority, Due Date, Assigned To

3. **Operators**:
   - Text: equals, contains, starts with, ends with, is empty, is not empty
   - Number: equals, not equals, greater than, less than, between
   - Date: equals, before, after, between, in last X days, in next X days
   - Boolean: is true, is false
   - List: is one of, is not one of

**Components to Create**:
- `QueryBuilder.tsx` - Main query builder component
- `FilterCondition.tsx` - Single filter condition row
- `FilterGroup.tsx` - Group of conditions with AND/OR logic

**API Endpoint**:
- `POST /api/search/query` - Execute advanced query

---

### **Phase 2: Saved Searches** (2 hours)
**Priority**: HIGH

**Features**:
1. **Save Search Functionality**
   - Save current query with name
   - Save as private or shared
   - Set as default search
   - Quick access from sidebar

2. **Manage Saved Searches**
   - List all saved searches
   - Edit saved search
   - Delete saved search
   - Clone saved search
   - Share with team

3. **Quick Filters**
   - Recent searches (last 5)
   - Favorite searches
   - Shared searches
   - System searches (predefined)

**Components to Create**:
- `SavedSearches.tsx` - Saved searches management page
- `SaveSearchModal.tsx` - Modal to save current search
- `SavedSearchesSidebar.tsx` - Quick access sidebar widget

**API Endpoints**:
- `GET /api/saved-searches` - Get all saved searches
- `POST /api/saved-searches` - Create saved search
- `PUT /api/saved-searches/{id}` - Update saved search
- `DELETE /api/saved-searches/{id}` - Delete saved search

---

### **Phase 3: Global Search** (2 hours)
**Priority**: HIGH

**Features**:
1. **Unified Search Bar**
   - Search across all entities
   - Real-time suggestions
   - Keyboard shortcuts (Ctrl+K / Cmd+K)
   - Recent searches
   - Search history

2. **Search Results**
   - Grouped by entity type
   - Highlighted matches
   - Quick actions (view, edit, delete)
   - Pagination
   - Sort by relevance

3. **Search Scope**
   - All entities (default)
   - Specific entity type
   - Custom scope selection

**Components to Create**:
- `GlobalSearch.tsx` - Global search modal
- `SearchResults.tsx` - Search results display
- `SearchSuggestions.tsx` - Auto-complete suggestions

**API Endpoint**:
- `GET /api/search/global?q={query}&scope={scope}` - Global search

---

### **Phase 4: Filter Presets** (1 hour)
**Priority**: MEDIUM

**Features**:
1. **Predefined Filters**
   - My Contacts
   - Hot Leads (score ≥ 70)
   - Recent Contacts (last 30 days)
   - Unassigned Contacts
   - Active Opportunities
   - Overdue Activities
   - High-Value Deals (amount ≥ $50k)

2. **Custom Presets**
   - Create custom filter preset
   - Edit preset
   - Delete preset
   - Share preset with team

**Components to Create**:
- `FilterPresets.tsx` - Filter presets dropdown
- `CreatePresetModal.tsx` - Create custom preset

**API Endpoints**:
- `GET /api/filter-presets` - Get all presets
- `POST /api/filter-presets` - Create preset

---

## 🗂️ **Database Schema**

### **SavedSearch Model**
```csharp
public class SavedSearch
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string EntityType { get; set; } // Contact, Company, Opportunity, Activity
    public string QueryJson { get; set; } // JSON representation of query
    public bool IsShared { get; set; }
    public bool IsDefault { get; set; }
    public int CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastUsedAt { get; set; }
    public int UseCount { get; set; }
}
```

### **SearchHistory Model**
```csharp
public class SearchHistory
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Query { get; set; }
    public string EntityType { get; set; }
    public DateTime SearchedAt { get; set; }
    public int ResultCount { get; set; }
}
```

---

## 🔧 **Technical Implementation**

### **Backend Service**
```csharp
public interface ISearchService
{
    Task<SearchResults> GlobalSearchAsync(string query, string? scope);
    Task<QueryResults> ExecuteQueryAsync(QueryDefinition query);
    Task<SavedSearch> SaveSearchAsync(SavedSearch search);
    Task<List<SavedSearch>> GetSavedSearchesAsync(int userId);
}
```

### **Query Definition Format**
```json
{
  "entityType": "Contact",
  "conditions": [
    {
      "field": "LeadScore",
      "operator": "greaterThan",
      "value": 70,
      "logic": "AND"
    },
    {
      "field": "Status",
      "operator": "equals",
      "value": "Active",
      "logic": "AND"
    }
  ],
  "sort": {
    "field": "CreatedAt",
    "direction": "desc"
  },
  "page": 1,
  "pageSize": 50
}
```

---

## 🎨 **UI/UX Design**

### **Query Builder**
```
┌─────────────────────────────────────────────────────┐
│ Advanced Search                                      │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ [Field ▼] [Operator ▼] [Value      ] [Remove] │ │
│ │ Lead Score  Greater Than   70                   │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ [AND ▼]                                         │ │
│ │ [Field ▼] [Operator ▼] [Value      ] [Remove] │ │
│ │ Status      Equals         Active               │ │
│ └─────────────────────────────────────────────────┘ │
│ [+ Add Condition]  [+ Add Group]                    │
│                                                      │
│ [Save Search] [Clear] [Search]                      │
└─────────────────────────────────────────────────────┘
```

### **Global Search**
```
┌─────────────────────────────────────────────────────┐
│ 🔍 Search everything...                    Ctrl+K   │
├─────────────────────────────────────────────────────┤
│ Recent Searches                                      │
│ • Hot leads in California                           │
│ • Opportunities closing this month                  │
│                                                      │
│ Contacts (5)                                         │
│ • John Doe - Acme Corp                              │
│ • Jane Smith - Tech Inc                             │
│                                                      │
│ Companies (2)                                        │
│ • Acme Corporation                                  │
│ • Tech Innovations Inc                              │
│                                                      │
│ Opportunities (3)                                    │
│ • Enterprise Deal - $50,000                         │
└─────────────────────────────────────────────────────┘
```

---

## 📊 **Implementation Phases**

### **Phase 1: Advanced Query Builder** (3 hours)
**Day 1 - Morning**
- [ ] Create QueryBuilder component
- [ ] Create FilterCondition component
- [ ] Create FilterGroup component
- [ ] Implement field/operator/value logic
- [ ] Add AND/OR group support
- [ ] Create backend query execution service
- [ ] Add POST /api/search/query endpoint
- [ ] Test query builder with sample data

### **Phase 2: Saved Searches** (2 hours)
**Day 1 - Afternoon**
- [ ] Create SavedSearch model
- [ ] Add DbSet to ApplicationDbContext
- [ ] Create SavedSearches CRUD endpoints
- [ ] Create SavedSearches page
- [ ] Create SaveSearchModal component
- [ ] Add quick access sidebar widget
- [ ] Test save/load/delete functionality

### **Phase 3: Global Search** (2 hours)
**Day 2 - Morning**
- [ ] Create GlobalSearch component
- [ ] Add keyboard shortcut (Ctrl+K)
- [ ] Implement search suggestions
- [ ] Create SearchResults component
- [ ] Add GET /api/search/global endpoint
- [ ] Implement full-text search logic
- [ ] Add search history tracking
- [ ] Test global search across entities

### **Phase 4: Filter Presets** (1 hour)
**Day 2 - Afternoon**
- [ ] Create FilterPresets component
- [ ] Add predefined filter presets
- [ ] Create custom preset functionality
- [ ] Add preset sharing
- [ ] Test preset application

---

## 🧪 **Testing Checklist**

### **Query Builder**
- [ ] Add single condition
- [ ] Add multiple conditions
- [ ] Add AND/OR groups
- [ ] Remove conditions
- [ ] Change operators
- [ ] Test all field types
- [ ] Test all operators
- [ ] Execute query
- [ ] Verify results

### **Saved Searches**
- [ ] Save search
- [ ] Load saved search
- [ ] Edit saved search
- [ ] Delete saved search
- [ ] Share search
- [ ] Set as default
- [ ] Quick access works

### **Global Search**
- [ ] Search across all entities
- [ ] Search specific entity
- [ ] Auto-complete works
- [ ] Keyboard shortcut works
- [ ] Recent searches display
- [ ] Results grouped correctly
- [ ] Click result navigates

### **Filter Presets**
- [ ] Apply predefined preset
- [ ] Create custom preset
- [ ] Edit preset
- [ ] Delete preset
- [ ] Share preset

---

## 📈 **Success Metrics**

### **Performance**
- Search results < 500ms
- Auto-complete < 200ms
- Query builder renders < 100ms

### **Usability**
- 90% of searches use saved searches
- 50% of users use global search
- Average 3 conditions per query

---

## 🎯 **Deliverables**

### **Frontend** (React/TypeScript)
1. QueryBuilder.tsx
2. FilterCondition.tsx
3. FilterGroup.tsx
4. SavedSearches.tsx
5. SaveSearchModal.tsx
6. GlobalSearch.tsx
7. SearchResults.tsx
8. FilterPresets.tsx

### **Backend** (C#/.NET)
1. SavedSearch model
2. SearchHistory model
3. ISearchService interface
4. SearchService implementation
5. SearchController with endpoints
6. Query execution logic
7. Full-text search implementation

### **Documentation**
1. Search & Filtering user guide
2. Query builder examples
3. API documentation
4. Testing documentation

---

## 💡 **Business Value**

### **User Benefits**
- ✅ Find information faster
- ✅ Create complex queries easily
- ✅ Reuse common searches
- ✅ Search across all data
- ✅ Save time with presets

### **Business Benefits**
- ✅ Improved productivity
- ✅ Better data insights
- ✅ Reduced training time
- ✅ Enhanced user satisfaction
- ✅ Competitive advantage

---

## 🚀 **Ready to Start?**

**Estimated Completion**: 8 hours (1 day)

**Let's begin with Phase 1: Advanced Query Builder!**

Would you like to proceed?
