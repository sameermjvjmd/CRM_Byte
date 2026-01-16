-- Add Act! CRM fields to Contacts table
-- Safe script that checks if columns exist before adding

-- Sal

utation
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Contacts]') AND name = 'Salutation')
BEGIN
    ALTER TABLE Contacts ADD Salutation NVARCHAR(20) NULL;
    PRINT 'Added Salutation column';
END

-- Mobile Phone
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Contacts]') AND name = 'MobilePhone')
BEGIN
    ALTER TABLE Contacts ADD MobilePhone NVARCHAR(20) NULL;
    PRINT 'Added MobilePhone column';
END

-- Fax
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Contacts]') AND name = 'Fax')
BEGIN
    ALTER TABLE Contacts ADD Fax NVARCHAR(20) NULL;
    PRINT 'Added Fax column';
END

-- Phone Extension
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Contacts]') AND name = 'PhoneExtension')
BEGIN
    ALTER TABLE Contacts ADD PhoneExtension NVARCHAR(10) NULL;
    PRINT 'Added PhoneExtension column';
END

-- Department (might already exist, update if needed)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Contacts]') AND name = 'Department')
BEGIN
    ALTER TABLE Contacts ADD Department NVARCHAR(100) NULL;
    PRINT 'Added Department column';
END
ELSE
BEGIN
    -- Update existing Department column to have max length if it doesn't
    PRINT 'Department column already exists';
END

-- Referred By Id
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Contacts]') AND name = 'ReferredById')
BEGIN
    ALTER TABLE Contacts ADD ReferredById INT NULL;
    PRINT 'Added ReferredById column';
END

-- Last Result
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Contacts]') AND name = 'LastResult')
BEGIN
    ALTER TABLE Contacts ADD LastResult NVARCHAR(MAX) NULL;
    PRINT 'Added LastResult column';
END

-- Website
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Contacts]') AND name = 'Website')
BEGIN
    ALTER TABLE Contacts ADD Website NVARCHAR(255) NULL;
    PRINT 'Added Website column';
END

PRINT 'Act! CRM fields migration complete!';
GO
