CRM DEPLOYMENT INSTRUCTIONS
===========================

1. Copy 'crm-api' folder to C:\inetpub\wwwroot\crm-api
2. Copy 'crm-web' folder to C:\inetpub\wwwroot\crm-web

3. IIS Configuration needed:

   [Backend API]
   - Site Name: CRM-Api
   - Physical Path: C:\inetpub\wwwroot\crm-api
   - Bindings: Port 5000 (http)
   - App Pool: No Managed Code (.NET CLR Version: No Managed Code)

   [Frontend Web]
   - Site Name: CRM-Web
   - Physical Path: C:\inetpub\wwwroot\crm-web
   - Bindings: Port 80 (http)
   - App Pool: No Managed Code

4. Database:
   - Ensure SQL Server is accessible from the server.
   - Update 'crm-api\appsettings.json' ConnectionStrings if needed.

5. Prerequisites on Server:
   - .NET 8.0 Hosting Bundle (or later)
   - IIS URL Rewrite Module (for Frontend SPA routing)
