# Custom Fields Administration Module

## 1. Overview
The Custom Fields module allows Administrators to extend the data model of Nexus CRM without writing code. You can add new fields to Contacts, Companies, and Opportunities to capture business-specific data.

## 2. Accessing the Manager
*   **Path**: Sidebar > Admin > Custom Fields.
*   **Permission**: Requires `Admin` role.

## 3. Supported Field Types
Nexus CRM supports a wide range of data types to ensure data integrity:

| Type | Description | Example |
| :--- | :--- | :--- |
| **Text** | Single line of text | "Account Number" |
| **Number** | Integer or Decimal | "Employee Count" |
| **Currency** | Monetary value (formatted) | "Annual Budget ($)" |
| **Percentage** | Percent value (0-100) | "Commission Rate (%)" |
| **Date** | Date picker | "Contract Expiry" |
| **Boolean** | Checkbox (True/False) | "Is VIP?" |
| **Select** | Dropdown (Single Choice) | "Industry" (Tech, Health, etc.) |
| **MultiSelect** | Dropdown (Multiple Choice) | "Interests" (Golf, Coding, etc.) |
| **Email** | Validated Email format | "Secondary Email" |
| **URL** | Application Link | "LinkedIn Profile" |

## 4. Creating a New Field
1.  Navigate to **Admin > Custom Fields**.
2.  Select the **Entity** tab (e.g., **Contact**, **Company**).
3.  Click **+ Add Field**.
4.  **Field Configuration**:
    *   **Label**: The name shown to users (e.g., "Customer Tier").
    *   **Key**: Auto-generated internal ID (e.g., `customer_tier`).
    *   **Type**: Select one of the supported types (e.g., `Select`).
    *   **Required**: Check this box to make the field mandatory on creation.
    *   **Options** (For Select/MultiSelect): Enter comma-separated values (e.g., "Bronze, Silver, Gold").
5.  Click **Save Field**.

## 5. Editing Existing Fields
1.  Locate the field in the list.
2.  Click the **Edit** (Pencil) icon.
3.  **Modifiable Properties**:
    *   Label
    *   Required Status
    *   Sort Order
    *   Options (Adding new options to dropdowns).
4.  **Non-Modifiable**: You cannot change the `Type` of a field once created (to prevent data loss).
5.  Click **Update**.

## 6. Deleting Fields
1.  Click the **Delete** (Trash) icon next to a field.
2.  **Confirm**: A warning will appear.
3.  **Impact**: Deleting a field removes all data associated with that field across all records. This action cannot be undone.

## 7. Field Layout & Ordering
*   Fields appear in the order they are listed in the Admin panel.
*   To reorder, use the **Drag Handle** (if available) or edit the **Sort Order** number in the Edit modal.
*   Fields are automatically rendered in the "Extended Profile" section of the entity's Detail View.
