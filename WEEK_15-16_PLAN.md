# Week 15-16 Implementation Plan: Workflow Automation & Quotes

## Overview
**Phase**: Week 15-16 - Automation & Sales Tools
**Start Date**: January 28, 2026
**Goal**: Implement Workflow Automation and Quote Management to complete the Sales module.

---

## 📋 Implementation Checklist

### **Backend (4-6 hours)**

#### 1. Product Catalog (Foundation for Quotes)
- [ ] Create `Product` model (Name, SKU, Price, Cost, Description, Taxable)
- [ ] Create `ProductsController` (CRUD)
- [ ] Migration for Products

#### 2. Quote Management
- [ ] Create `Quote` model (Subject, OpportunityId, ContactId, ExpirationDate, Status, Total)
- [ ] Create `QuoteLineItem` model (QuoteId, ProductId, Quantity, Price, Discount)
- [ ] Create `QuotesController` (CRUD, Calculation logic)
- [ ] PDF Generation Service (using a library or frontend-based)

#### 3. Workflow Automation
- [ ] Create `WorkflowRule` model (TriggerType, ConditionJson, ActionJson, IsActive)
- [ ] Create `WorkflowService` (Rules engine evaluator)
- [ ] Implement Triggers:
  - `OnRecordCreate`
  - `OnRecordUpdate`
  - `OnStageChange`
- [ ] Implement Actions:
  - `SendEmail`
  - `CreateTask`
  - `UpdateField`

---

### **Frontend (8-10 hours)**

#### 4. Product Management
- [ ] Create `ProductsPage.tsx` (List/Create/Edit)
- [ ] Product Picker component (for Quotes)

#### 5. Quote Builder
- [ ] Create `QuotesPage.tsx`
- [ ] Quote Editor (Add products, calculate totals, tax, discount)
- [ ] PDF Export (using `jspdf` + `jspdf-autotable`)

#### 6. Workflow Editor
- [ ] Create `WorkflowsPage.tsx`
- [ ] Rule Builder UI (Form-based: When X happens, If Y is true, Do Z)

---

## 🔧 Technical Stack

### Libraries to Install
```bash
npm install jspdf jspdf-autotable
```

## 🎯 Success Criteria
- [ ] Can create and manage Products
- [ ] Can create a Quote, add products, and download PDF
- [ ] Can create a Workflow Rule (e.g. "When Opportunity Won -> Send Email")
- [ ] Workflow fires correctly on trigger
