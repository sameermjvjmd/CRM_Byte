@echo off
REM Quick script to truncate custom fields tables using dotnet ef
echo Truncating Custom Fields Tables...
cd /d "%~dp0.."
dotnet ef database execute --sql "DELETE FROM AppCustomFieldValues; DELETE FROM AppCustomFields; DBCC CHECKIDENT ('AppCustomFieldValues', RESEED, 0); DBCC CHECKIDENT ('AppCustomFields', RESEED, 0);" --project CRM.Api
echo Done!
pause
