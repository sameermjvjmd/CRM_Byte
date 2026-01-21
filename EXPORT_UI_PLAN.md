# 🎨 Frontend Export UI - Implementation Plan

## 🎯 **Goal**
Add export buttons to all major pages so users can easily export data to PDF and Excel.

---

## 📋 **Pages to Update**

### **1. Contacts Page** ⭐
- Add "Export" dropdown button
- Options: Export to PDF, Export to Excel
- Location: Top right, next to "Add Contact"

### **2. Companies Page**
- Add "Export" dropdown button
- Options: Export to PDF, Export to Excel
- Location: Top right, next to "Add Company"

### **3. Opportunities Page**
- Add "Export" dropdown button
- Options: Export to PDF, Export to Excel
- Location: Top right, next to "Add Opportunity"

### **4. Activities Page**
- Add "Export" dropdown button
- Options: Export to PDF, Export to Excel
- Location: Top right, next to "Add Activity"

---

## 🎨 **UI Design**

### **Export Button Component**
```tsx
<ExportMenu
  onExportPdf={() => handleExport('pdf')}
  onExportExcel={() => handleExport('excel')}
/>
```

### **Visual Design**:
- Dropdown button with download icon
- Two options: "Export to PDF" and "Export to Excel"
- Icons: PDF icon (red), Excel icon (green)
- Loading state during export
- Success toast notification

---

## 🔧 **Implementation Steps**

### **Step 1: Create ExportMenu Component** (30 mins)
File: `CRM.Web/src/components/common/ExportMenu.tsx`

Features:
- Dropdown menu with PDF and Excel options
- Loading state
- Icons for each format
- Accessible keyboard navigation

### **Step 2: Create Export Utility** (15 mins)
File: `CRM.Web/src/utils/exportUtils.ts`

Functions:
- `exportToPdf(endpoint, filename)`
- `exportToExcel(endpoint, filename)`
- Handle blob download
- Error handling

### **Step 3: Update Contacts Page** (20 mins)
File: `CRM.Web/src/pages/ContactsPage.tsx`

Add:
- Import ExportMenu
- Export handlers
- Position button in header

### **Step 4: Update Companies Page** (15 mins)
File: `CRM.Web/src/pages/CompaniesPage.tsx`

### **Step 5: Update Opportunities Page** (15 mins)
File: `CRM.Web/src/pages/OpportunitiesPage.tsx`

### **Step 6: Update Activities Page** (15 mins)
File: `CRM.Web/src/pages/ActivitiesPage.tsx`

---

## ⏱️ **Time Estimate**

- ExportMenu Component: 30 mins
- Export Utility: 15 mins
- Contacts Page: 20 mins
- Companies Page: 15 mins
- Opportunities Page: 15 mins
- Activities Page: 15 mins
- Testing: 20 mins

**Total**: ~2.5 hours

---

## 🎯 **Success Criteria**

After implementation:
- ✅ Users can export contacts to PDF/Excel
- ✅ Users can export companies to PDF/Excel
- ✅ Users can export opportunities to PDF/Excel
- ✅ Users can export activities to PDF/Excel
- ✅ Loading states work correctly
- ✅ Error handling works
- ✅ Files download with correct names
- ✅ Toast notifications show success/error

---

Let's start implementing! 🚀
