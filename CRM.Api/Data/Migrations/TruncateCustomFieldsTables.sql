-- Truncate Custom Fields Tables
-- Run this script to clear all custom field data and start fresh

-- Step 1: Delete all values (child records)
DELETE FROM AppCustomFieldValues;
GO

-- Step 2: Delete all field definitions (parent records)
DELETE FROM AppCustomFields;
GO

-- Step 3: Reset identity seeds (optional - starts IDs from 1 again)
DBCC CHECKIDENT ('AppCustomFieldValues', RESEED, 0);
DBCC CHECKIDENT ('AppCustomFields', RESEED, 0);
GO

PRINT 'Custom fields tables truncated successfully!';
