# Test Guide for Recent Implementations

This document provides step-by-step instructions to test the recently implemented features in the CRM. Use this as a reference for verifying functionality and for future learning.

## 1. Advanced Lookup Page (`/lookup`)

**Objective:** Verify that users can search across entities using multiple criteria and save their searches.

### 1.1 Multi-Criteria Search
1.  Navigate to the **Advanced Lookup** page (`/lookup`).
2.  Select **Contacts** as the entity type.
3.  Enter a name (e.g., "John") in the **Search Query** box and press Enter. Verify results appear.
4.  Click **+ Add Criteria**.
5.  Set the first row to: `City` `Contains` `New York`.
6.  Click **+ Add Criteria** again.
7.  Set the second row to: `Email` `Ends With` `.com`.
8.  Click **Search**.
9.  **Expected Result:** The results list should only show contacts that match ALL criteria (Name is "John" AND City is "New York" AND Email ends with ".com").

### 1.2 "All" and "Groups" Placeholders
1.  Click the **All** or **Groups** button in the "Search In" section.
2.  **Expected Result:** A toast message should appear saying "Global and Group search coming soon!" or similar. The search should not execute.

### 1.3 Save Search
1.  Build a valid search (e.g., Contacts where City contains "Chicago").
2.  Click the **Save This Search** button (floppy disk icon) at the bottom left of the search card.
3.  Enter a name (e.g., "Chicago Contacts") in the input field.
4.  Click the green **Save** button.
5.  **Expected Result:** A success message "Search saved!" should appear.

### 1.4 Load Saved Search
1.  Refresh the page or click **Reset**.
2.  Locate the dropdown menu in the top-right corner of the page header ("Load Saved Query...").
3.  Select the "Chicago Contacts" search you just created.
4.  **Expected Result:**
    *   The Entity Type should switch to **Contacts**.
    *   The criteria rows should automatically populate with `City` `Contains` `Chicago`.
    *   You can now click Search to run it immediately.

---

## 2. Dynamic Group Creation

**Objective:** Verify that users can create a "Dynamic Group" that automatically marks itself as dynamic based on a saved search.

### 2.1 Create Dynamic Group
1.  Navigate to any page with the **+ Create New** button (top right).
2.  Select **Group** from the dropdown or modal tabs.
3.  Enter a **Group Name** (e.g., "VIP Customers").
4.  Locate the **Dynamic Group (Smart Group)** toggle switch.
5.  **Test Fix:** Click anywhere on the "Dynamic Group" label or the toggle switch itself. It should toggle ON/OFF easily (this was previously broken).
6.  Toggle it **ON**.
7.  Select a **Source Saved Search** from the dropdown (you must have created a saved search in step 1.3).
8.  Click **Create Record**.
9.  **Expected Result:** The group is created. If you view the group details, it should indicate it is a Dynamic Group.

---

## 3. Sales Pipeline Navigation

**Objective:** Verify navigation from the Kanban board to opportunity details.

### 3.1 Opportunity Card Click
1.  Navigate to the **Sales Pipeline** page (kanban board).
2.  Hover over any deal card. Notice the cursor changes to a pointer (hand icon).
3.  Click on the card body (not the drag handle or the menu button).
4.  **Expected Result:** You should be redirected closer to the **Opportunity Details** page (`/opportunities/{id}`) for that specific deal.

---

## General Testing Tips
*   **Clear Cache:** If something looks wrong, try a hard refresh (Ctrl+F5) to ensure you aren't seeing cached files.
*   **Backend Check:** If a search fails or data doesn't save, check the terminal where `dotnet run` is executing for any red error text.
*   **Browser Console:** Press F12 to open developer tools. Look at the "Console" tab for any red JavaScript errors if buttons don't react.
