# CRM ACT - Bug Fix Implementation Plan
**Date:** January 17, 2026  
**Status:** In Progress

---

## Executive Summary

This plan addresses critical bugs preventing core CRM functionality:
1. **Authentication**: Users cannot login (401 error)
2. **Contact Creation**: "New Contact" button non-functional
3. **Form Validation**: Phone field incorrectly marked as required
4. **IIS Compatibility**: PUT/DELETE requests blocked (405 error)

---

## Phase 1: Backend Fixes

### 1.1 Fix Contact Model Validation
**File:** `CRM.Api/Models/Contact.cs`  
**Issue:** `Phone` and `Email` are non-nullable, causing implicit [Required] validation  
**Solution:** Change to nullable strings

```csharp
// BEFORE
public string Email { get; set; } = string.Empty;
public string Phone { get; set; } = string.Empty;

// AFTER  
public string? Email { get; set; }
public string? Phone { get; set; }
```

**Status:** ✅ COMPLETED (Step 800)

---

### 1.2 Add Admin Seed Endpoint
**File:** `CRM.Api/Controllers/AuthController.cs`  
**Issue:** Admin user missing from tenant database  
**Solution:** Add endpoint to create/reset admin user

```csharp
[HttpPost("seed-admin")]
[AllowAnonymous]
public async Task<IActionResult> SeedAdmin([FromBody] SeedAdminRequest request)
{
    // Validate tenant
    // Check if user exists
    // Create or update admin user with BCrypt password
    // Return success
}
```

**Status:** ⏳ PENDING

---

### 1.3 Fix IIS web.config
**File:** `CRM.Api/publish/web.config`  
**Issue:** WebDAV module blocks PUT/DELETE; OPTIONSVerbHandler blocks CORS preflight  
**Solution:** Remove handlers

```xml
<modules>
  <remove name="WebDAVModule" />
</modules>
<handlers>
  <remove name="WebDAV" />
  <remove name="OPTIONSVerbHandler" />
  <add name="aspNetCore" ... />
</handlers>
```

**Status:** ✅ COMPLETED (Step 812)

---

## Phase 2: Frontend Fixes

### 2.1 Fix "New Contact" Button
**File:** `CRM.Web/src/pages/ContactsPage.tsx`  
**Issue:** Button has no onClick handler  
**Solution:** Add modal state and handler

```tsx
// Add import
import CreateModal from '../components/CreateModal';

// Add state
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

// Add onClick to button
<button onClick={() => setIsCreateModalOpen(true)}>
  NEW CONTACT
</button>

// Add modal component
<CreateModal 
  isOpen={isCreateModalOpen}
  onClose={() => setIsCreateModalOpen(false)}
  onSuccess={fetchContacts}
  initialType="Contact"
/>
```

**Status:** ✅ COMPLETED (Step 839)

---

### 2.2 Improve Error Handling in CreateModal
**File:** `CRM.Web/src/components/CreateModal.tsx`  
**Issue:** Generic error message hides validation details  
**Solution:** Display detailed errors from API response

```tsx
} catch (error: any) {
    const data = error.response?.data;
    let details = '';
    if (data?.errors) {
        details = '\nDetails:\n' + Object.entries(data.errors)
            .map(([key, val]) => `${key}: ${val}`)
            .join('\n');
    }
    alert(`Failed: ${data?.title || error.message}${details}`);
}
```

**Status:** ✅ COMPLETED (Step 773)

---

### 2.3 Handle Empty Strings as Null
**File:** `CRM.Web/src/components/CreateModal.tsx`  
**Issue:** Empty strings may fail validation  
**Solution:** Convert to null before sending

```tsx
payload = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone || null,
    jobTitle: formData.jobTitle || null,
    // ... other fields
};
```

**Status:** ✅ COMPLETED (Step 752)

---

## Phase 3: Build & Package

### 3.1 Build API
```powershell
cd d:\Project(s)\CRM_ACT\CRM.Api
dotnet publish -c Release -o publish
```
**Status:** ✅ COMPLETED

### 3.2 Fix web.config After Publish
Publish overwrites web.config, so re-apply fixes after each build.
**Status:** ✅ COMPLETED (Step 812)

### 3.3 Package API
```powershell
Compress-Archive -Path ".\publish\*" -DestinationPath "..\CRM_API_Deploy.zip" -Force
```
**Status:** ✅ COMPLETED (Step 842)

### 3.4 Build Frontend
```powershell
cd d:\Project(s)\CRM_ACT\CRM.Web
npx vite build
```
**Status:** ✅ COMPLETED (Step 848)

### 3.5 Package Frontend
```powershell
Compress-Archive -Path ".\dist\*" -DestinationPath "..\CRM_Web_Deploy.zip" -Force
```
**Status:** ✅ COMPLETED (Step 851)

---

## Phase 4: Deployment

### 4.1 Deploy API Package
1. Stop IIS App Pool for API
2. Extract `CRM_API_Deploy.zip` to API folder
3. Start IIS App Pool

### 4.2 Deploy Web Package
1. Stop IIS App Pool for Web
2. Extract `CRM_Web_Deploy.zip` to Web folder
3. Start IIS App Pool

### 4.3 Clear Caches
- Restart IIS App Pool
- Clear browser cache (Ctrl+Shift+Delete)

**Status:** ⏳ PENDING (User Action Required)

---

## Phase 5: Data Recovery (Fix Login)

### Option A: Register New Tenant
1. Go to https://bytesymphony.in/register
2. Create new organization (e.g., `byte2`)
3. Login with new credentials

### Option B: Seed Admin User (Requires Code Change)
1. Implement `POST /api/auth/seed-admin` endpoint
2. Deploy updated API
3. Call endpoint to create admin user
4. Login with seeded credentials

**Status:** ⏳ PENDING (User Decision Required)

---

## Remaining Tasks

| # | Task | Priority | Status |
|---|------|----------|--------|
| 1 | Implement seed-admin endpoint | HIGH | ⏳ Pending |
| 2 | Deploy CRM_API_Deploy.zip | HIGH | ⏳ Pending |
| 3 | Deploy CRM_Web_Deploy.zip | HIGH | ⏳ Pending |
| 4 | Fix login (seed or register) | HIGH | ⏳ Pending |
| 5 | Test contact creation | MEDIUM | ⏳ Pending |
| 6 | Test PUT/DELETE operations | MEDIUM | ⏳ Pending |

---

## Success Criteria

- [ ] User can login successfully
- [ ] "New Contact" button opens modal
- [ ] Contact form submits without validation error
- [ ] Contact appears in list after creation
- [ ] PUT requests work (update contact)
- [ ] DELETE requests work (delete contact)

---

## Files Modified

| File | Changes |
|------|---------|
| `CRM.Api/Models/Contact.cs` | Made Phone/Email nullable |
| `CRM.Api/publish/web.config` | Removed WebDAV/OPTIONS handlers |
| `CRM.Web/src/pages/ContactsPage.tsx` | Added CreateModal + onClick |
| `CRM.Web/src/components/CreateModal.tsx` | Better error handling + null conversion |

---

## Deployment Packages

| Package | Location | Contains |
|---------|----------|----------|
| `CRM_API_Deploy.zip` | `d:\Project(s)\CRM_ACT\` | API with all backend fixes |
| `CRM_Web_Deploy.zip` | `d:\Project(s)\CRM_ACT\` | Frontend with all UI fixes |
