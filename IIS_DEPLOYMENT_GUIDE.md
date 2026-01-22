# 🚀 IIS Deployment Guide for CRM System

**Date**: January 22, 2026  
**Status**: Ready for Deployment

---

## 📋 **Prerequisites**

Before running the deployment script, ensure you have the following installed:

1.  **IIS (Internet Information Services)**
    *   Enabled in Windows Features.
2.  **ASP.NET Core Hosting Bundle**
    *   Downloads: [https://dotnet.microsoft.com/en-us/download/dotnet/8.0](https://dotnet.microsoft.com/en-us/download/dotnet/8.0) (Select "Hosting Bundle")
    *   Required for running .NET apps on IIS.
3.  **URL Rewrite Module**
    *   Download: [https://www.iis.net/downloads/microsoft/url-rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)
    *   Required for React SPA routing.
4.  **Node.js** (for building frontend)

---

## 🛠️ **Automated Deployment**

We have provided a PowerShell script `publish_to_iis.ps1` to automate the process.

**Steps:**
1.  Open PowerShell as **Administrator** (Right-click -> Run as Administrator).
2.  Navigate to the project folder.
3.  Run the script:
    ```powershell
    .\publish_to_iis.ps1
    ```

**What the script does:**
1.  Stops existing IIS sites (`CRM-Web`, `CRM-Api`).
2.  Builds the **Backend API** (Release mode) to `C:\inetpub\wwwroot\crm-api`.
3.  Builds the **Frontend Web** (Production build) to `C:\inetpub\wwwroot\crm-web`.
4.  Creates/Configures IIS App Pools:
    *   `CRM-Api-Pool` (No Managed Code)
    *   `CRM-Web-Pool` (No Managed Code)
5.  Creates/Configures IIS Sites:
    *   `CRM-Web` on **Port 80**
    *   `CRM-Api` on **Port 5000**
6.  Creates `web.config` for React routing (SPA fallback).

---

## 🔧 **Manual Configuration (If Script Fails)**

### **1. Backend API**
- **Folder**: `C:\inetpub\wwwroot\crm-api`
- **IIS Site**: `CRM-Api`
- **Port**: 5000
- **App Pool**: `CRM-Api-Pool` (.NET CLR Version: **No Managed Code**)

### **2. Frontend Web**
- **Folder**: `C:\inetpub\wwwroot\crm-web`
- **IIS Site**: `CRM-Web`
- **Port**: 80 (or 8080 if 80 is taken)
- **App Pool**: `CRM-Web-Pool`
- **web.config for SPA**:
  Ensure the following `web.config` exists in `C:\inetpub\wwwroot\crm-web`:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <configuration>
    <system.webServer>
      <rewrite>
        <rules>
          <rule name="React Routes" stopProcessing="true">
            <match url=".*" />
            <conditions logicalGrouping="MatchAll">
              <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
              <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            </conditions>
            <action type="Rewrite" url="/" />
          </rule>
        </rules>
      </rewrite>
    </system.webServer>
  </configuration>
  ```

---

## 🔍 **Validation**

After deployment:

1.  **Open Frontend**: [http://localhost](http://localhost)
    *   Should load the login page.
2.  **Open API (Docs)**: [http://localhost:5000/scalar/v1](http://localhost:5000/scalar/v1)
    *   Should load Scalar UI.
3.  **Check Logs**:
    *   Check `Event Viewer` -> Windows Logs -> Application for any IIS errors.
    *   Check `C:\inetpub\wwwroot\crm-api\logs` if configured.

---

## ⚠️ **Troubleshooting**

- **HTTP Error 500.19**: Usually missing Hosting Bundle. Install it.
- **Port 5000 In Use**: If `dotnet run` is still running via CLI, stop it.
- **404 on API calls**: Ensure Backend site is running on Port 5000.
- **404 on Refresh (Frontend)**: URL Rewrite module missing or clean web.config missing.

