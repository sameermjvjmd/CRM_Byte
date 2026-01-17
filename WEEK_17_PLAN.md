# Week 17 Implementation Plan: Custom Fields & Layouts

## Overview
**Phase**: Phase 4 - Custom Fields (Revisited/Prioritized)
**Start Date**: January 30, 2026
**Goal**: Implement a robust Custom Field system allowing users to define specific data fields (Text, Number, Date, Dropdown) for key entities (Contact, Company, Opportunity) and interact with them in the UI.

---

## 📋 Implementation Checklist

### **Backend (4-6 hours)**

#### 1. Data Schema (EAV Model)
- [x] Create `CustomFieldDefinition` model:
  - `Entity` (Contact, Company, Opportunity)
  - `FieldName` (Label)
  - `FieldKey` (Internal Name)
  - `FieldType` (Text, Number, Date, Bool, Select, MultiSelect)
  - `IsRequired`
  - `Options` (for Select types, stored as JSON)
  - `ValidationRegex` (optional)
- [x] Create `CustomFieldValue` model:
  - `EntityId`
  - `EntityType`
  - `FieldId` (FK)
  - `ValueStr` (string representation of value)
  - `ValueNum` (indexed for range queries)
  - `ValueDate` (indexed for date queries)
- [x] Database Migration

#### 2. API Controllers
- [x] `CustomFieldsController`:
  - `GET /definitions/{entityType}` - Get schema
  - `POST /definitions` - Create field
  - `PUT /definitions/{id}` - Update field
  - `DELETE /definitions/{id}` - Soft delete field
- [x] Extend `Contacts/Companies/OpportunitiesControllers` to:
  - [x] Return custom values in `GET /:id` details.
  - [x] Accept custom values in `POST/PUT` payload.

### **Frontend (8-10 hours)**

#### 3. Field Manager (Admin)
- [x] Create `CustomFieldsPage.tsx` (Admin Settings)
- [x] Field Editor Modal:
  - Define Label, Type, Options.
  - Form Preview.

#### 4. UI Integration
- [x] Update `ContactDetailPage.tsx` to render a "Custom Fields" tab or section.
  - Dynamically render inputs based on `FieldType`.
- [x] Update `CreateModal.tsx` to optionally include required custom fields.

---

## 🔧 Technical Considerations

### Storage Strategy
We will use a hybrid approach:
1.  **Reference Data**: `CustomFieldDefinitions` table for schema.
2.  **Value Storage**: `CustomFieldValues` table (EAV - Entity Attribute Value) for flexibility.
    *   *Alternative*: JSON column on the main table.
    *   *Decision*: EAV allows better indexing in SQL Server for filtering/reporting later.

### Field Types to Support
- **Text**: Simple input
- **Number**: Input type="number"
- **Date**: Date picker
- **Yes/No**: Checkbox or Switch
- **Dropdown**: Select with predefined options (JSON list)
- **URL**: Link with validation

## 🎯 Success Criteria
- [x] User can see these fields on a Contact record.
- [x] User can edit these fields and save.
- [x] Values persist correctly.
