using CRM.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace CRM.Api.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.EnsureCreated();

            // Check for Address1 column and add if missing
            try 
            {
                // We use a try-catch block or check existence to safe guard
                // But a simple way for SQL Server is using raw SQL logic or just executing specific ALTER statements that we know are needed.
                // Since EnsureCreated() only works if DB doesn't exist, and here it likely DOES exist but is old, we need to alter.
                
                var connection = context.Database.GetDbConnection();
                connection.Open();
                
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = @"
                    IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'Address1' AND Object_ID = Object_ID(N'Contacts')) ALTER TABLE Contacts ADD Address1 NVARCHAR(100) NULL;
                    IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'Address2' AND Object_ID = Object_ID(N'Contacts')) ALTER TABLE Contacts ADD Address2 NVARCHAR(100) NULL;
                    IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'City' AND Object_ID = Object_ID(N'Contacts')) ALTER TABLE Contacts ADD City NVARCHAR(50) NULL;
                    IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'State' AND Object_ID = Object_ID(N'Contacts')) ALTER TABLE Contacts ADD State NVARCHAR(50) NULL;
                    IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'Zip' AND Object_ID = Object_ID(N'Contacts')) ALTER TABLE Contacts ADD Zip NVARCHAR(20) NULL;
                    IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'Country' AND Object_ID = Object_ID(N'Contacts')) ALTER TABLE Contacts ADD Country NVARCHAR(50) NULL;
                    IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'ReferredBy' AND Object_ID = Object_ID(N'Contacts')) ALTER TABLE Contacts ADD ReferredBy NVARCHAR(100) NULL;
                    IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'Department' AND Object_ID = Object_ID(N'Contacts')) ALTER TABLE Contacts ADD Department NVARCHAR(MAX) NULL;
                    IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'PreferredContactMethod' AND Object_ID = Object_ID(N'Contacts')) ALTER TABLE Contacts ADD PreferredContactMethod NVARCHAR(MAX) NULL;
                    
                    -- NEW Act! CRM Fields
                    IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'Salutation' AND Object_ID = Object_ID(N'Contacts')) ALTER TABLE Contacts ADD Salutation NVARCHAR(20) NULL;
                    IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'MobilePhone' AND Object_ID = Object_ID(N'Contacts')) ALTER TABLE Contacts ADD MobilePhone NVARCHAR(20) NULL;
                    IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'Fax' AND Object_ID = Object_ID(N'Contacts')) ALTER TABLE Contacts ADD Fax NVARCHAR(20) NULL;
                    IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'PhoneExtension' AND Object_ID = Object_ID(N'Contacts')) ALTER TABLE Contacts ADD PhoneExtension NVARCHAR(10) NULL;
                    IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'ReferredById' AND Object_ID = Object_ID(N'Contacts')) ALTER TABLE Contacts ADD ReferredById INT NULL;
                    IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'LastResult' AND Object_ID = Object_ID(N'Contacts')) ALTER TABLE Contacts ADD LastResult NVARCHAR(MAX) NULL;
                    IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'Website' AND Object_ID = Object_ID(N'Contacts')) ALTER TABLE Contacts ADD Website NVARCHAR(255) NULL;
                    IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'LeadScore' AND Object_ID = Object_ID(N'Contacts')) ALTER TABLE Contacts ADD LeadScore INT NULL;
                    
                    -- Marketing Enhancements
                    IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LeadScoringRules]') AND type in (N'U'))
                    BEGIN
                        IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'UpdatedAt' AND Object_ID = Object_ID(N'LeadScoringRules')) 
                            ALTER TABLE LeadScoringRules ADD UpdatedAt DATETIME2 NULL;
                    END

                    IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CampaignRecipients]') AND type in (N'U'))
                    BEGIN
                        IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'CurrentStepId' AND Object_ID = Object_ID(N'CampaignRecipients')) 
                            ALTER TABLE CampaignRecipients ADD CurrentStepId INT NULL;
                        IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'NextStepScheduledAt' AND Object_ID = Object_ID(N'CampaignRecipients')) 
                            ALTER TABLE CampaignRecipients ADD NextStepScheduledAt DATETIME2 NULL;
                    END

                    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
                    BEGIN
                        CREATE TABLE [dbo].[Users] (
                            [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                            [Username] NVARCHAR(100) NOT NULL,
                            [FullName] NVARCHAR(100) NOT NULL,
                            [Email] NVARCHAR(100) NOT NULL,
                            [Role] NVARCHAR(50) NOT NULL DEFAULT 'User',
                            [IsActive] BIT NOT NULL DEFAULT 1,
                            [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                            [LastLogin] DATETIME2 NULL
                        );
                    END

                    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Activities]') AND type in (N'U'))
                    BEGIN
                        CREATE TABLE [dbo].[Activities] (
                            [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                            [Subject] NVARCHAR(200) NOT NULL,
                            [Type] NVARCHAR(50) NOT NULL,
                            [StartTime] DATETIME2 NOT NULL,
                            [EndTime] DATETIME2 NOT NULL,
                            [Priority] NVARCHAR(50) NOT NULL DEFAULT 'Medium',
                            [IsCompleted] BIT NOT NULL DEFAULT 0,
                            [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                            [LastModifiedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                            [ContactId] INT NULL,
                            [CompanyId] INT NULL,
                            [OpportunityId] INT NULL,
                            CONSTRAINT FK_Activities_Contacts FOREIGN KEY (ContactId) REFERENCES Contacts(Id),
                            CONSTRAINT FK_Activities_Companies FOREIGN KEY (CompanyId) REFERENCES Companies(Id),
                            CONSTRAINT FK_Activities_Opportunities FOREIGN KEY (OpportunityId) REFERENCES Opportunities(Id)
                        );
                    END

                    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HistoryItems]') AND type in (N'U'))
                    BEGIN
                        CREATE TABLE [dbo].[HistoryItems] (
                            [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                            [Type] NVARCHAR(50) NOT NULL,
                            [Result] NVARCHAR(50) NULL,
                            [Regarding] NVARCHAR(200) NOT NULL,
                            [Date] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                            [DurationMinutes] INT NOT NULL DEFAULT 0,
                            [Details] NVARCHAR(MAX) NULL,
                            [ContactId] INT NULL,
                            [CompanyId] INT NULL,
                            [OpportunityId] INT NULL,
                            CONSTRAINT FK_HistoryItems_Contacts FOREIGN KEY (ContactId) REFERENCES Contacts(Id),
                            CONSTRAINT FK_HistoryItems_Companies FOREIGN KEY (CompanyId) REFERENCES Companies(Id),
                            CONSTRAINT FK_HistoryItems_Opportunities FOREIGN KEY (OpportunityId) REFERENCES Opportunities(Id)
                        );
                    END

                    IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Documents]') AND type in (N'U'))
                    BEGIN
                        CREATE TABLE [dbo].[Documents] (
                            [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                            [FileName] NVARCHAR(255) NOT NULL,
                            [StoredFileName] NVARCHAR(255) NOT NULL,
                            [ContentType] NVARCHAR(100) NULL,
                            [FileSize] BIGINT NOT NULL,
                            [UploadedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                            [ContactId] INT NULL,
                            [CompanyId] INT NULL,
                            [GroupId] INT NULL,
                            [OpportunityId] INT NULL,
                            CONSTRAINT FK_Documents_Contacts FOREIGN KEY (ContactId) REFERENCES Contacts(Id),
                            CONSTRAINT FK_Documents_Companies FOREIGN KEY (CompanyId) REFERENCES Companies(Id),
                            CONSTRAINT FK_Documents_Groups FOREIGN KEY (GroupId) REFERENCES Groups(Id),
                            CONSTRAINT FK_Documents_Opportunities FOREIGN KEY (OpportunityId) REFERENCES Opportunities(Id)
                        );
                    END

                    IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'Stage' AND Object_ID = Object_ID(N'Opportunities'))
                    BEGIN
                         -- Assuming Opportunities table exists, if not EnsureCreated handles it.
                         -- If Stage was added or modified.
                         -- Just in case.
                         SELECT 1; 
                    END
                    ";
                    command.ExecuteNonQuery();
                }
            }
            catch (Exception ex)
            {
                // Log or ignore if it fails (e.g. table doesn't exist yet, which EnsureCreated should handle)
                Console.WriteLine($"DB Update Error: {ex.Message}");
            }
        }
    }
}
