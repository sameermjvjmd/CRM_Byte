# Custom Fields & Layouts: Comprehensive Testing Guide

This guide provides a step-by-step verification plan for the Custom Fields module in the CRM. It covers configuration, data entry, display, and validation across all supported entity types.

## Prerequisites
- Ensure the Backend API is running (`dotnet run` in `CRM.Api`).
- Ensure the Frontend is running (`npm run dev` in `CRM.Web`).
- Log in as an Administrator (to access specific configuration pages).

---

## Phase 1: Admin Configuration (Field Definitions)
**Objective**: Verify that custom fields can be defined, edited, and deleted for different entities.

### Test Case 1.1: Create Custom Fields
1. Navigate to **Administration > Custom Fields** (`/admin/custom-fields`).
2. **Contact Fields**:
   - Click **Add Field**.
   - **Label**: `T-Shirt Size`
   - **Type**: `Select`
   - **Options**: `Small`, `Medium`, `Large`, `XL` (one per line).
   - **Required**: Unchecked.
   - Click **Create Field**.
   - *Verify*: Field appears in the list.
3. **Company Fields**:
   - Switch tab to **Company**.
   - Click **Add Field**.
   - **Label**: `Establishment Date`
   - **Type**: `Date`.
   - Click **Create Field**.
4. **Opportunity Fields**:
   - Switch tab to **Opportunity**.
   - Click **Add Field**.
   - **Label**: `Budget Approved`
   - **Type**: `Boolean` (Yes/No).
   - Click **Create Field**.

### Test Case 1.2: Edit Field Definitions
1. Find the `T-Shirt Size` field in the **Contact** tab.
2. Click the **Edit** (Pencil) icon.
3. Change **Label** to `Preferred Shirt Size`.
4. Add `XXL` to the **Options**.
5. Click **Save Changes**.
6. *Verify*: The label and options are updated in the list.

### Test Case 1.3: Delete Field
1. Create a dummy field (e.g., `Temp Field` / `Text`).
2. Click the **Delete** (Trash) icon.
3. Confirm the deletion prompt.
4. *Verify*: The field is removed from the list.

---

## Phase 2: Data Entry (Create Modal)
**Objective**: Verify that custom fields appear and capture data during entity creation.

### Test Case 2.1: Create Contact with Custom Data
1. Click the global **+ (Plus)** button or "Add Contact" in the sidebar.
2. Select **Contact** type.
3. Fill in mandatory fields (First Name, Last Name).
4. Scroll to the **Additional Details** custom section.
5. *Verify*: `Preferred Shirt Size` dropdown appears with options (Small, Medium, Large, XL, XXL).
6. Select `Large`.
7. Click **Create Contact**.
8. *Verify*: Success message appears.

### Test Case 2.2: Create Company with Custom Data
1. Open the **Create Modal**.
2. Select **Company** type.
3. Fill in Company Name.
4. Locate the **Additional Details** section.
5. *Verify*: `Establishment Date` date picker appears.
6. Select a date.
7. Click **Create Company**.

### Test Case 2.3: Create Opportunity with Custom Data
1. Open the **Create Modal**.
2. Select **Opportunity** type.
3. Fill in Name, Stage, Amount.
4. Locate **Additional Details**.
5. *Verify*: `Budget Approved` dropdown/switch appears.
6. Set to `Yes`.
7. Click **Create Opportunity**.

---

## Phase 3: Detail Pages (View & Edit)
**Objective**: Verify that custom data is persistent, viewable, and editable on detail pages.

### Test Case 3.1: Contact Detail View
1. Navigate to the **Contacts** list.
2. Open the Contact created in *Test Case 2.1*.
3. Click on the **Custom Fields** tab (you may need to scroll the tab bar).
4. *Verify*: `Preferred Shirt Size` is set to `Large`.
5. Change value to `Medium`.
6. Click **Save Changes**.
7. Reload the page (F5).
8. *Verify*: `Preferred Shirt Size` persists as `Medium`.

### Test Case 3.2: Company Detail View
1. Navigate to **Companies** list.
2. Open the Company created in *Test Case 2.2*.
3. Click the **Custom Fields** tab.
4. *Verify*: `Establishment Date` is correct.
5. Change the date.
6. Click **Save Changes** and reload.
7. *Verify*: The new date persists.

### Test Case 3.3: Opportunity Detail View
1. Navigate to **Opportunities** list.
2. Open the Opportunity created in *Test Case 2.3*.
3. Click the **Custom Fields** tab.
4. *Verify*: `Budget Approved` is `Yes`.
5. Change to `No`.
6. Click **Save Changes** and reload.
7. *Verify*: Value persists as `No`.

---

## Phase 4: Advanced Field Types Verification
**Objective**: Ensure all specific field types render and behave correctly.

### Test Case 4.1: URL Field
1. **Admin**: Add a `LinkedIn Profile` (URL) field to Contacts.
2. **Detail Page**: Open a Contact > Custom Fields tab.
3. Enter `https://linkedin.com/in/test`.
4. Save.
5. *Verify*: In View Mode (if applicable) or generally, it should handle the string. *Note: Current implementation allows editing. Ensure it saves.*

### Test Case 4.2: Currency Field
1. **Admin**: Add `Monthly Spending` (Currency) field to Contacts.
2. **Detail Page**: Enter `500.50`.
3. Save.
4. *Verify*: Input allows numeric values.

### Test Case 4.3: Email Field
1. **Admin**: Add `Backup Email` (Email) field to Contacts.
2. **Detail Page**: Enter `test@example.com`.
3. Save.
4. *Verify*: Input accepts email format.

### Test Case 4.4: Multi-Select Field
1. **Admin**: Add `Target Markets` (MultiSelect) field to Companies. Options: `US`, `EU`, `APAC`.
2. **Detail Page**: Select `US` and `EU` (Hold Ctrl/Cmd to select multiple).
3. Save.
4. *Verify*: Both values are saved (comma-separated or JSON array in backend). Reload to confirm selection remains.

---

## Phase 5: Validation & Edge Cases

### Test Case 5.1: Required Fields
1. **Admin**: Edit `Preferred Shirt Size` on Contact and check **Required**.
2. **Create Modal**: Try to create a Contact *without* selecting a size.
3. *Verify*: Browser validation or Form validation prevents submission or highlights the field.

### Test Case 5.2: Empty States
1. Create a new entity without filling custom fields.
2. Go to Detail Page > Custom Fields.
3. *Verify*: Fields appear empty but editable.
4. *Verify*: No errors in console regarding null/undefined values.

### Test Case 5.3: Deleted Fields Data
1. **Admin**: Delete the `T-Shirt Size` field.
2. **Detail Page**: Open the Contact that had a T-Shirt size.
3. *Verify*: The field no longer appears in the Custom Fields tab.
4. *Verify*: Page loads without crashing.

---

## Troubleshooting
- **Loader Spinning Forever**: Check Network tab for 500 errors on `/api/CustomFields/...`. Ensure Backend is running.
- **Values Not Saving**: Check console for 400 Bad Request. Ensure the payload matches the expected `CustomFieldValue` format (`{ customFieldDefinitionId, value }`).
- **New Fields Not Showing**: Hard refresh the browser to clear any cached schema definitions.
