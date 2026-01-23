# Contacts Management Module

## 1. Overview
The Contacts module is the central repository for all person-based data in Nexus CRM. It allows you to track individuals, their contact information, associated companies, communication history, and custom attributes.

## 2. Accessing Contacts
1.  **Sidebar**: Click on the **Contacts** icon/link in the left sidebar.
2.  **Global Search**: Type a name in the top search bar and select the contact from results.
3.  **Direct URL**: Navigate to `/contacts`.

## 3. The Contacts Interface
The main Contacts page features:
*   **Action Toolbar** (Top):
    *   **+ New Contact**: Open the creation modal.
    *   **Import**: Upload contacts from CSV.
    *   **Export**: Download current view to Excel/CSV.
    *   **Filter**: Toggle advanced filter panel.
*   **View Options**:
    *   **List View**: Standard grid with columns (Name, Email, Phone, Company).
    *   **Board View**: Kanban-style cards (useful if grouping by Status).

## 4. Creating a Contact
To add a new person:
1.  Click the **+ New Contact** button.
2.  **General Section**:
    *   **Salutation**: (Optional) Mr., Ms., Dr., etc.
    *   **First Name**: (Required) e.g., "John".
    *   **Last Name**: (Required) e.g., "Doe".
    *   **Title**: Job title, e.g., "CEO".
    *   **Department**: e.g., "Sales".
3.  **Communication**:
    *   **Email**: (Required) Primary email address.
    *   **Phone**: Work/Office number.
    *   **Mobile**: Personal cell number.
4.  **Relationships**:
    *   **Company**: Link to an existing Company record.
    *   **Referred By**: Link to another contact who referred this person.
5.  **Address**:
    *   Street, City, State, Zip, Country.
6.  **Additional Details (Custom Fields)**:
    *   If your administrator has defined custom fields (e.g., "Budget", "Tier"), they will appear at the bottom of the form.
    *   These fields enforce their specific types (e.g., Currency fields will format as money).
7.  Click **Create Record** to save.

## 5. Editing a Contact
1.  Open the Contact Detail page (click on the name in the list).
2.  Click the **Edit** button (Pencil icon) at the top right.
3.  Modify any fields in the modal.
4.  **Note**: Custom Fields are located at the bottom of the Edit Modal.
5.  Click **Save Changes**.

## 6. The Contact Detail View
When viewing a single contact, the page is divided into:
*   **Header**: Name, Title, and Quick Actions (Call, Email).
*   **Left Sidebar**:
    *   **Contact Info**: Phones, Emails, Address.
    *   **Extended Profile**: Displays all **Custom Field** values (e.g., Budget: $50,000).
    *   **Tags**: Manage tags for quick filtering.
*   **Main Content Tabs**:
    *   **Overview**: Timeline of recent activity.
    *   **Notes**: Text notes pinned to the record.
    *   **Emails**: History of sent/received emails.
    *   **Activities**: Upcoming and past tasks/meetings.
    *   **Related**: Linked Opportunities and Cases.

## 7. Deleting a Contact
*   **Single Delete**: Open the contact, click the **More Actions (...)** menu -> **Delete**.
*   **Bulk Delete**: Select multiple contacts in List View -> Click **Delete** in the bulk action bar.
*   **Warning**: Deleting a contact may orphan associated notes or activities depending on system configuration.
