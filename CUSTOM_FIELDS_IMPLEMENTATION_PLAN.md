# 🎨 Custom Fields System - Implementation Plan

## 🎯 **Overview**

**Goal**: Enable users to create custom fields for Contacts, Companies, Opportunities, and other entities to adapt the CRM to their specific business needs.

**Time Estimate**: 8-10 hours  
**Priority**: 🟡 **HIGH VALUE**  
**Impact**: Major differentiator, high user demand

---

## 📋 **Feature Requirements**

### **Core Features**:
1. ✅ Create custom fields for different entities
2. ✅ Multiple field types (Text, Number, Date, Dropdown, etc.)
3. ✅ Field validation rules
4. ✅ Show/hide fields based on conditions
5. ✅ Reorder fields
6. ✅ Required/optional fields
7. ✅ Default values
8. ✅ Field groups/sections

### **Field Types to Support**:
1. **Text** - Single line text
2. **Textarea** - Multi-line text
3. **Number** - Numeric values
4. **Decimal** - Decimal numbers
5. **Date** - Date picker
6. **DateTime** - Date and time picker
7. **Dropdown** - Single select from options
8. **Multi-Select** - Multiple selections
9. **Checkbox** - Boolean yes/no
10. **URL** - Website links
11. **Email** - Email addresses
12. **Phone** - Phone numbers

---

## 🏗️ **Architecture Design**

### **Database Schema**:

#### **1. CustomField Table**
```sql
CREATE TABLE CustomFields (
    Id INT PRIMARY KEY IDENTITY,
    EntityType VARCHAR(50) NOT NULL,  -- Contact, Company, Opportunity, etc.
    FieldName VARCHAR(100) NOT NULL,
    DisplayName VARCHAR(100) NOT NULL,
    FieldType VARCHAR(50) NOT NULL,   -- Text, Number, Date, Dropdown, etc.
    IsRequired BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    DefaultValue NVARCHAR(MAX),
    ValidationRules NVARCHAR(MAX),    -- JSON
    Options NVARCHAR(MAX),            -- JSON for dropdown options
    DisplayOrder INT NOT NULL DEFAULT 0,
    SectionName VARCHAR(100),
    HelpText NVARCHAR(500),
    CreatedBy INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2,
    CONSTRAINT UQ_CustomField_Entity_Name UNIQUE (EntityType, FieldName)
);
```

#### **2. CustomFieldValue Table**
```sql
CREATE TABLE CustomFieldValues (
    Id INT PRIMARY KEY IDENTITY,
    CustomFieldId INT NOT NULL,
    EntityId INT NOT NULL,           -- ID of Contact, Company, etc.
    EntityType VARCHAR(50) NOT NULL,
    TextValue NVARCHAR(MAX),
    NumberValue DECIMAL(18,2),
    DateValue DATETIME2,
    BooleanValue BIT,
    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2,
    FOREIGN KEY (CustomFieldId) REFERENCES CustomFields(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_CustomFieldValue UNIQUE (CustomFieldId, EntityId)
);
```

#### **3. CustomFieldSection Table** (Optional)
```sql
CREATE TABLE CustomFieldSections (
    Id INT PRIMARY KEY IDENTITY,
    EntityType VARCHAR(50) NOT NULL,
    SectionName VARCHAR(100) NOT NULL,
    DisplayName VARCHAR(100) NOT NULL,
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsCollapsible BIT NOT NULL DEFAULT 1,
    IsCollapsedByDefault BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL,
    CONSTRAINT UQ_Section_Entity_Name UNIQUE (EntityType, SectionName)
);
```

---

## 🔧 **Implementation Steps**

### **Phase 1: Backend Foundation** (3-4 hours)

#### **Step 1.1: Create Models** (30 mins)
**File**: `CRM.Api/Models/CustomField.cs`

```csharp
public class CustomField
{
    public int Id { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public string FieldName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public CustomFieldType FieldType { get; set; }
    public bool IsRequired { get; set; }
    public bool IsActive { get; set; } = true;
    public string? DefaultValue { get; set; }
    public string? ValidationRules { get; set; }
    public string? Options { get; set; }
    public int DisplayOrder { get; set; }
    public string? SectionName { get; set; }
    public string? HelpText { get; set; }
    public int CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public enum CustomFieldType
{
    Text,
    Textarea,
    Number,
    Decimal,
    Date,
    DateTime,
    Dropdown,
    MultiSelect,
    Checkbox,
    URL,
    Email,
    Phone
}
```

**File**: `CRM.Api/Models/CustomFieldValue.cs`

```csharp
public class CustomFieldValue
{
    public int Id { get; set; }
    public int CustomFieldId { get; set; }
    public int EntityId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public string? TextValue { get; set; }
    public decimal? NumberValue { get; set; }
    public DateTime? DateValue { get; set; }
    public bool? BooleanValue { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    public CustomField? CustomField { get; set; }
}
```

#### **Step 1.2: Create DTOs** (30 mins)
**File**: `CRM.Api/DTOs/CustomField/CustomFieldDTOs.cs`

```csharp
public class CustomFieldDto
{
    public int Id { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public string FieldName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string FieldType { get; set; } = string.Empty;
    public bool IsRequired { get; set; }
    public bool IsActive { get; set; }
    public string? DefaultValue { get; set; }
    public List<ValidationRule>? ValidationRules { get; set; }
    public List<FieldOption>? Options { get; set; }
    public int DisplayOrder { get; set; }
    public string? SectionName { get; set; }
    public string? HelpText { get; set; }
}

public class CreateCustomFieldDto
{
    public string EntityType { get; set; } = string.Empty;
    public string FieldName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string FieldType { get; set; } = string.Empty;
    public bool IsRequired { get; set; }
    public string? DefaultValue { get; set; }
    public List<ValidationRule>? ValidationRules { get; set; }
    public List<FieldOption>? Options { get; set; }
    public string? SectionName { get; set; }
    public string? HelpText { get; set; }
}

public class CustomFieldValueDto
{
    public int CustomFieldId { get; set; }
    public string FieldName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string FieldType { get; set; } = string.Empty;
    public object? Value { get; set; }
}

public class ValidationRule
{
    public string Type { get; set; } = string.Empty; // MinLength, MaxLength, Pattern, etc.
    public string? Value { get; set; }
    public string? Message { get; set; }
}

public class FieldOption
{
    public string Label { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
}
```

#### **Step 1.3: Create Migration** (15 mins)
```bash
dotnet ef migrations add AddCustomFields
dotnet ef database update
```

#### **Step 1.4: Create Service** (1.5 hours)
**File**: `CRM.Api/Services/CustomFieldService.cs`

```csharp
public interface ICustomFieldService
{
    Task<List<CustomFieldDto>> GetCustomFieldsAsync(string entityType);
    Task<CustomFieldDto> GetCustomFieldByIdAsync(int id);
    Task<CustomFieldDto> CreateCustomFieldAsync(CreateCustomFieldDto dto, int userId);
    Task<CustomFieldDto> UpdateCustomFieldAsync(int id, CreateCustomFieldDto dto);
    Task<bool> DeleteCustomFieldAsync(int id);
    Task<List<CustomFieldValueDto>> GetEntityCustomFieldValuesAsync(string entityType, int entityId);
    Task SaveEntityCustomFieldValuesAsync(string entityType, int entityId, Dictionary<string, object> values);
}
```

#### **Step 1.5: Create Controller** (1 hour)
**File**: `CRM.Api/Controllers/CustomFieldsController.cs`

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomFieldsController : ControllerBase
{
    private readonly ICustomFieldService _customFieldService;

    [HttpGet("{entityType}")]
    public async Task<ActionResult<List<CustomFieldDto>>> GetCustomFields(string entityType)
    
    [HttpGet("field/{id}")]
    public async Task<ActionResult<CustomFieldDto>> GetCustomField(int id)
    
    [HttpPost]
    public async Task<ActionResult<CustomFieldDto>> CreateCustomField(CreateCustomFieldDto dto)
    
    [HttpPut("{id}")]
    public async Task<ActionResult<CustomFieldDto>> UpdateCustomField(int id, CreateCustomFieldDto dto)
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCustomField(int id)
    
    [HttpGet("{entityType}/{entityId}/values")]
    public async Task<ActionResult<List<CustomFieldValueDto>>> GetEntityValues(string entityType, int entityId)
    
    [HttpPost("{entityType}/{entityId}/values")]
    public async Task<IActionResult> SaveEntityValues(string entityType, int entityId, Dictionary<string, object> values)
}
```

---

### **Phase 2: Frontend Foundation** (2-3 hours)

#### **Step 2.1: Create Types** (15 mins)
**File**: `CRM.Web/src/types/customField.ts`

```typescript
export interface CustomField {
  id: number;
  entityType: string;
  fieldName: string;
  displayName: string;
  fieldType: CustomFieldType;
  isRequired: boolean;
  isActive: boolean;
  defaultValue?: string;
  validationRules?: ValidationRule[];
  options?: FieldOption[];
  displayOrder: number;
  sectionName?: string;
  helpText?: string;
}

export type CustomFieldType = 
  | 'Text'
  | 'Textarea'
  | 'Number'
  | 'Decimal'
  | 'Date'
  | 'DateTime'
  | 'Dropdown'
  | 'MultiSelect'
  | 'Checkbox'
  | 'URL'
  | 'Email'
  | 'Phone';

export interface ValidationRule {
  type: string;
  value?: string;
  message?: string;
}

export interface FieldOption {
  label: string;
  value: string;
  isDefault: boolean;
}

export interface CustomFieldValue {
  customFieldId: number;
  fieldName: string;
  displayName: string;
  fieldType: string;
  value: any;
}
```

#### **Step 2.2: Create Custom Field Renderer** (1.5 hours)
**File**: `CRM.Web/src/components/CustomFieldRenderer.tsx`

Component that renders different field types dynamically based on configuration.

#### **Step 2.3: Create Custom Field Manager** (1 hour)
**File**: `CRM.Web/src/components/CustomFieldManager.tsx`

Admin interface to create, edit, and manage custom fields.

---

### **Phase 3: Integration** (2-3 hours)

#### **Step 3.1: Update Contact Form** (45 mins)
Add custom fields section to contact create/edit forms

#### **Step 3.2: Update Company Form** (45 mins)
Add custom fields section to company create/edit forms

#### **Step 3.3: Update Opportunity Form** (45 mins)
Add custom fields section to opportunity create/edit forms

#### **Step 3.4: Update Detail Pages** (45 mins)
Show custom field values on detail pages

---

### **Phase 4: Admin UI** (1-2 hours)

#### **Step 4.1: Custom Fields Settings Page** (1.5 hours)
**File**: `CRM.Web/src/pages/settings/CustomFieldsPage.tsx`

Admin page to manage custom fields for all entities.

---

## 📊 **Time Breakdown**

| Phase | Task | Time |
|-------|------|------|
| **Phase 1** | Backend Foundation | 3-4 hours |
| | Models & DTOs | 1 hour |
| | Migration | 15 mins |
| | Service Layer | 1.5 hours |
| | Controller | 1 hour |
| **Phase 2** | Frontend Foundation | 2-3 hours |
| | Types | 15 mins |
| | Field Renderer | 1.5 hours |
| | Field Manager | 1 hour |
| **Phase 3** | Integration | 2-3 hours |
| | Contact Form | 45 mins |
| | Company Form | 45 mins |
| | Opportunity Form | 45 mins |
| | Detail Pages | 45 mins |
| **Phase 4** | Admin UI | 1-2 hours |
| | Settings Page | 1.5 hours |
| **Total** | | **8-12 hours** |

---

## 🎯 **Success Criteria**

After implementation:
- ✅ Admins can create custom fields for any entity
- ✅ Support for 12 different field types
- ✅ Fields appear on create/edit forms
- ✅ Field values are saved and displayed
- ✅ Validation rules work correctly
- ✅ Fields can be reordered
- ✅ Fields can be made required/optional
- ✅ Dropdown options work correctly
- ✅ Custom fields show on detail pages
- ✅ Professional UI/UX

---

## 💡 **Implementation Approach**

### **Option A: Full Implementation** (8-12 hours)
Implement all features as described above

### **Option B: MVP First** (4-6 hours) ⭐ **RECOMMENDED**
Start with:
1. Basic field types (Text, Number, Date, Dropdown)
2. Simple validation (required/optional)
3. One entity (Contacts)
4. Basic admin UI

Then expand to:
- More field types
- Advanced validation
- Other entities
- Enhanced UI

---

## 🚀 **Recommended Next Steps**

1. **Start with MVP** (Option B)
2. **Test thoroughly** with Contacts
3. **Expand** to other entities
4. **Add** advanced features
5. **Polish** UI/UX

---

**Ready to start implementing?**

**A.** Start with MVP (4-6 hours) ⭐ **RECOMMENDED**  
**B.** Full implementation (8-12 hours)  
**C.** Review plan first  
**D.** Different approach  

Let me know! 🎯
