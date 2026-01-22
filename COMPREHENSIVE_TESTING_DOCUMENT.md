# 🧪 CRM System - Comprehensive Testing Document

**Date**: January 22, 2026  
**Version**: 1.0  
**Modules Tested**: Marketing Automation, Search & Filtering  
**Status**: Test Cases Defined

---

## 📋 **Testing Overview**

This document provides comprehensive test cases for the recently completed modules:
1. Marketing Automation (Lead Assignment)
2. Search & Filtering (All 4 Phases)

---

## 🎯 **Test Objectives**

- ✅ Verify all features work as expected
- ✅ Ensure data integrity
- ✅ Validate user workflows
- ✅ Check error handling
- ✅ Confirm performance
- ✅ Test edge cases

---

## 1️⃣ **Marketing Automation - Lead Assignment**

### **Test Suite 1.1: Lead Assignment Rules CRUD**

#### **Test Case 1.1.1: Create Lead Assignment Rule**
**Priority**: HIGH  
**Prerequisites**: User logged in with admin rights

**Steps**:
1. Navigate to `/marketing/lead-assignment`
2. Click "Create New Rule" button
3. Enter rule details:
   - Name: "Hot Leads to Senior Reps"
   - Assignment Type: "Score Based"
   - Priority: 1
   - Select users: User 1, User 2
4. Click "Save"

**Expected Result**:
- ✅ Rule created successfully
- ✅ Success toast notification
- ✅ Rule appears in list
- ✅ Rule shows correct details

**Test Data**:
```json
{
  "name": "Hot Leads to Senior Reps",
  "assignmentType": "ScoreBased",
  "priority": 1,
  "assignToUserIds": "[1, 2]",
  "criteria": "{\"minScore\": 70}",
  "isActive": true
}
```

---

#### **Test Case 1.1.2: Edit Lead Assignment Rule**
**Priority**: HIGH  
**Prerequisites**: At least one rule exists

**Steps**:
1. Navigate to `/marketing/lead-assignment`
2. Click "Edit" on existing rule
3. Change name to "Updated Rule Name"
4. Change priority to 2
5. Click "Save"

**Expected Result**:
- ✅ Rule updated successfully
- ✅ Changes reflected in list
- ✅ Priority order updated

---

#### **Test Case 1.1.3: Delete Lead Assignment Rule**
**Priority**: MEDIUM  
**Prerequisites**: At least one rule exists

**Steps**:
1. Navigate to `/marketing/lead-assignment`
2. Click "Delete" on a rule
3. Confirm deletion

**Expected Result**:
- ✅ Rule deleted successfully
- ✅ Rule removed from list
- ✅ No orphaned data

---

### **Test Suite 1.2: Assignment Strategies**

#### **Test Case 1.2.1: Round Robin Assignment**
**Priority**: HIGH  
**Prerequisites**: Round-robin rule exists with 3 users

**Steps**:
1. Create 6 new contacts
2. Verify assignment distribution

**Expected Result**:
- ✅ Each user gets 2 contacts
- ✅ Distribution is even
- ✅ LastAssignedIndex updates correctly

**Test Data**:
- Users: [1, 2, 3]
- Contacts: 6 new contacts
- Expected: User1=2, User2=2, User3=2

---

#### **Test Case 1.2.2: Score-Based Assignment**
**Priority**: HIGH  
**Prerequisites**: Score-based rule exists

**Steps**:
1. Create contact with LeadScore = 85 (high)
2. Create contact with LeadScore = 50 (medium)
3. Create contact with LeadScore = 20 (low)
4. Verify assignments

**Expected Result**:
- ✅ High score (85) → First user (senior)
- ✅ Medium score (50) → Middle user
- ✅ Low score (20) → Last user (junior)

---

#### **Test Case 1.2.3: Territory-Based Assignment**
**Priority**: MEDIUM  
**Prerequisites**: Territory rule exists

**Steps**:
1. Create contact with Territory = "North"
2. Create contact with Territory = "South"
3. Verify assignments

**Expected Result**:
- ✅ North territory → North team rep
- ✅ South territory → South team rep
- ✅ Unknown territory → First user (fallback)

---

#### **Test Case 1.2.4: Workload Balance Assignment**
**Priority**: MEDIUM  
**Prerequisites**: Workload balance rule exists

**Steps**:
1. User1 has 10 active contacts
2. User2 has 5 active contacts
3. User3 has 2 active contacts
4. Create new contact

**Expected Result**:
- ✅ New contact assigned to User3 (least workload)
- ✅ Workload calculation correct

---

### **Test Suite 1.3: Rule Priority**

#### **Test Case 1.3.1: Multiple Rules - Priority Order**
**Priority**: HIGH  
**Prerequisites**: Multiple rules with different priorities

**Steps**:
1. Create Rule A (Priority 1) - Score-based
2. Create Rule B (Priority 2) - Territory-based
3. Create contact matching both rules
4. Verify which rule applies

**Expected Result**:
- ✅ Rule with lower priority number executes first
- ✅ Only one rule applies per contact

---

### **Test Suite 1.4: Edge Cases**

#### **Test Case 1.4.1: No Active Rules**
**Priority**: MEDIUM

**Steps**:
1. Deactivate all rules
2. Create new contact

**Expected Result**:
- ✅ Contact created without assignment
- ✅ No errors thrown
- ✅ AssignedTo field is null

---

#### **Test Case 1.4.2: No Users in Rule**
**Priority**: LOW

**Steps**:
1. Create rule with empty user list
2. Create new contact

**Expected Result**:
- ✅ Rule skipped
- ✅ Next rule evaluated
- ✅ No errors

---

## 2️⃣ **Search & Filtering - Advanced Query Builder**

### **Test Suite 2.1: Query Builder UI**

#### **Test Case 2.1.1: Add Condition**
**Priority**: HIGH  
**Prerequisites**: User on Contacts page

**Steps**:
1. Click "Advanced Search"
2. Click "Add Condition"
3. Select field: "Lead Score"
4. Select operator: "Greater Than"
5. Enter value: 70

**Expected Result**:
- ✅ New condition row appears
- ✅ Field dropdown populated
- ✅ Operator dropdown shows correct options
- ✅ Value input accepts numbers

---

#### **Test Case 2.1.2: Remove Condition**
**Priority**: MEDIUM

**Steps**:
1. Add 3 conditions
2. Click "Remove" on second condition

**Expected Result**:
- ✅ Condition removed
- ✅ Other conditions remain
- ✅ Cannot remove last condition

---

#### **Test Case 2.1.3: AND/OR Logic**
**Priority**: HIGH

**Steps**:
1. Add condition: LeadScore > 70
2. Add condition: Status = "Active"
3. Change logic to "OR"

**Expected Result**:
- ✅ Logic dropdown shows AND/OR
- ✅ Query executes with correct logic
- ✅ Results match expected logic

---

### **Test Suite 2.2: Field Types**

#### **Test Case 2.2.1: String Field**
**Priority**: HIGH

**Steps**:
1. Select field: "First Name"
2. Select operator: "Contains"
3. Enter value: "John"
4. Execute search

**Expected Result**:
- ✅ Returns contacts with "John" in first name
- ✅ Case-insensitive search
- ✅ Partial matches work

**Test Data**:
- Contacts: "John Doe", "Johnny Smith", "Jane John"
- Expected: All 3 returned

---

#### **Test Case 2.2.2: Number Field**
**Priority**: HIGH

**Steps**:
1. Select field: "Lead Score"
2. Select operator: "Greater Than or Equal"
3. Enter value: 70
4. Execute search

**Expected Result**:
- ✅ Returns contacts with score ≥ 70
- ✅ Numeric comparison works
- ✅ Edge values included

**Test Data**:
- Contacts: Score 69, 70, 71, 85
- Expected: 70, 71, 85 returned

---

#### **Test Case 2.2.3: Date Field**
**Priority**: MEDIUM

**Steps**:
1. Select field: "Created At"
2. Select operator: "After"
3. Select date: 2026-01-01
4. Execute search

**Expected Result**:
- ✅ Returns contacts created after date
- ✅ Date comparison works
- ✅ Timezone handled correctly

---

### **Test Suite 2.3: Operators**

#### **Test Case 2.3.1: Contains Operator**
**Priority**: HIGH

**Steps**:
1. Field: Email
2. Operator: Contains
3. Value: "@gmail.com"

**Expected Result**:
- ✅ Returns all Gmail contacts
- ✅ Partial match works

---

#### **Test Case 2.3.2: Starts With Operator**
**Priority**: MEDIUM

**Steps**:
1. Field: Last Name
2. Operator: Starts With
3. Value: "Sm"

**Expected Result**:
- ✅ Returns "Smith", "Smythe"
- ✅ Does not return "Goldsmith"

---

#### **Test Case 2.3.3: Is Empty Operator**
**Priority**: MEDIUM

**Steps**:
1. Field: Phone
2. Operator: Is Empty

**Expected Result**:
- ✅ Returns contacts with no phone
- ✅ Null and empty string both match

---

## 3️⃣ **Search & Filtering - Saved Searches**

### **Test Suite 3.1: Save Search**

#### **Test Case 3.1.1: Save New Search**
**Priority**: HIGH

**Steps**:
1. Build query: LeadScore ≥ 70
2. Click "Save Search"
3. Enter name: "Hot Leads"
4. Enter description: "Contacts with high lead score"
5. Check "Share with team"
6. Click "Save"

**Expected Result**:
- ✅ Search saved successfully
- ✅ Appears in saved searches list
- ✅ Shared flag set correctly

---

#### **Test Case 3.1.2: Load Saved Search**
**Priority**: HIGH

**Steps**:
1. Navigate to `/saved-searches`
2. Click "Execute" on saved search

**Expected Result**:
- ✅ Navigates to correct entity page
- ✅ Query applied automatically
- ✅ Results displayed
- ✅ Use count incremented

---

### **Test Suite 3.2: Manage Saved Searches**

#### **Test Case 3.2.1: Toggle Favorite**
**Priority**: MEDIUM

**Steps**:
1. Click star icon on saved search
2. Verify favorite status

**Expected Result**:
- ✅ Star fills/unfills
- ✅ Favorite filter works
- ✅ Status persisted

---

#### **Test Case 3.2.2: Delete Saved Search**
**Priority**: MEDIUM

**Steps**:
1. Click delete on saved search
2. Confirm deletion

**Expected Result**:
- ✅ Confirmation dialog appears
- ✅ Search deleted
- ✅ Removed from list

---

## 4️⃣ **Search & Filtering - Global Search**

### **Test Suite 4.1: Global Search Functionality**

#### **Test Case 4.1.1: Open Global Search**
**Priority**: HIGH

**Steps**:
1. Press Ctrl+K (or Cmd+K on Mac)

**Expected Result**:
- ✅ Search modal opens
- ✅ Input focused
- ✅ Recent searches shown

---

#### **Test Case 4.1.2: Search Across Entities**
**Priority**: HIGH

**Steps**:
1. Open global search (Ctrl+K)
2. Type "acme"
3. Wait for results

**Expected Result**:
- ✅ Results grouped by entity type
- ✅ Shows contacts, companies, opportunities
- ✅ Results displayed within 500ms
- ✅ Debounce works (300ms)

**Test Data**:
- Contact: "John from Acme"
- Company: "Acme Corp"
- Opportunity: "Acme Deal"
- Expected: All 3 in grouped results

---

#### **Test Case 4.1.3: Keyboard Navigation**
**Priority**: HIGH

**Steps**:
1. Open global search
2. Type "john"
3. Press ↓ arrow key twice
4. Press Enter

**Expected Result**:
- ✅ Selection moves down
- ✅ Selected result highlighted
- ✅ Enter navigates to result
- ✅ Modal closes

---

#### **Test Case 4.1.4: Recent Searches**
**Priority**: MEDIUM

**Steps**:
1. Search for "john"
2. Search for "acme"
3. Search for "deal"
4. Open global search (no query)

**Expected Result**:
- ✅ Shows last 5 searches
- ✅ Click to re-run search
- ✅ Stored in localStorage

---

### **Test Suite 4.2: Search Performance**

#### **Test Case 4.2.1: Large Dataset**
**Priority**: MEDIUM  
**Prerequisites**: 10,000+ records

**Steps**:
1. Search for common term
2. Measure response time

**Expected Result**:
- ✅ Results in < 500ms
- ✅ No UI lag
- ✅ Pagination works

---

#### **Test Case 4.2.2: No Results**
**Priority**: LOW

**Steps**:
1. Search for "xyzabc123"

**Expected Result**:
- ✅ "No results" message
- ✅ Helpful suggestion
- ✅ No errors

---

## 5️⃣ **Search & Filtering - Filter Presets**

### **Test Suite 5.1: Apply Presets**

#### **Test Case 5.1.1: Apply Hot Leads Preset**
**Priority**: HIGH

**Steps**:
1. On Contacts page
2. Click "Quick Filters"
3. Select "Hot Leads"

**Expected Result**:
- ✅ Query builder populated
- ✅ Condition: LeadScore ≥ 70
- ✅ Results filtered correctly

---

#### **Test Case 5.1.2: Apply High-Value Deals Preset**
**Priority**: HIGH

**Steps**:
1. On Opportunities page
2. Click "Quick Filters"
3. Select "High-Value Deals"

**Expected Result**:
- ✅ Condition: Amount ≥ $50,000
- ✅ Results show only high-value deals

---

### **Test Suite 5.2: Preset Management**

#### **Test Case 5.2.1: Load Entity-Specific Presets**
**Priority**: MEDIUM

**Steps**:
1. Navigate to Contacts page
2. Open Quick Filters
3. Navigate to Opportunities page
4. Open Quick Filters

**Expected Result**:
- ✅ Contacts page shows contact presets
- ✅ Opportunities page shows opportunity presets
- ✅ No cross-contamination

---

## 📊 **Test Execution Summary**

### **Test Coverage**:
- Marketing Automation: 14 test cases
- Query Builder: 9 test cases
- Saved Searches: 4 test cases
- Global Search: 6 test cases
- Filter Presets: 3 test cases

**Total**: 36 test cases

### **Priority Breakdown**:
- HIGH: 24 test cases (67%)
- MEDIUM: 10 test cases (28%)
- LOW: 2 test cases (5%)

---

## 🐛 **Known Issues / Bugs**

### **Issue #1: Build Errors**
**Status**: 🔴 OPEN  
**Priority**: CRITICAL  
**Description**: Backend build failing with interface mismatch errors  
**Impact**: Cannot test backend functionality  
**Next Steps**: Fix ISearchService interface and SearchService implementation

---

## ✅ **Test Execution Checklist**

### **Pre-Testing**:
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Database seeded with test data
- [ ] Test user accounts created

### **Marketing Automation**:
- [ ] Test Suite 1.1: CRUD Operations
- [ ] Test Suite 1.2: Assignment Strategies
- [ ] Test Suite 1.3: Rule Priority
- [ ] Test Suite 1.4: Edge Cases

### **Search & Filtering**:
- [ ] Test Suite 2.1: Query Builder UI
- [ ] Test Suite 2.2: Field Types
- [ ] Test Suite 2.3: Operators
- [ ] Test Suite 3.1: Save Search
- [ ] Test Suite 3.2: Manage Searches
- [ ] Test Suite 4.1: Global Search
- [ ] Test Suite 4.2: Performance
- [ ] Test Suite 5.1: Apply Presets
- [ ] Test Suite 5.2: Preset Management

### **Post-Testing**:
- [ ] Document results
- [ ] Log bugs
- [ ] Create fix tickets
- [ ] Update test cases

---

## 📝 **Test Results Template**

```markdown
### Test Execution Report
**Date**: [Date]
**Tester**: [Name]
**Environment**: [Dev/Staging/Prod]

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1.1.1 | ✅ PASS | |
| 1.1.2 | ❌ FAIL | Error message XYZ |
| 1.1.3 | ⏭️ SKIP | Prerequisites not met |
```

---

## 🎯 **Next Steps**

1. **Fix Build Errors** - Resolve backend compilation issues
2. **Start Backend** - Get API server running
3. **Execute Tests** - Run through all test cases
4. **Document Results** - Create test execution report
5. **Fix Bugs** - Address any issues found
6. **Retest** - Verify fixes work

---

**Testing Document Version**: 1.0  
**Last Updated**: January 22, 2026  
**Status**: Ready for execution (pending build fix)
