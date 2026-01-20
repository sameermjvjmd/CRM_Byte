IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[QuoteTemplates]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[QuoteTemplates] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(100) NOT NULL,
        [CompanyName] nvarchar(200) NOT NULL,
        [CompanyAddress] nvarchar(500) NOT NULL,
        [CompanyLogoUrl] nvarchar(max) NULL,
        [PrimaryColor] nvarchar(20) NOT NULL,
        [SecondaryColor] nvarchar(20) NOT NULL,
        [TextColor] nvarchar(max) NULL,
        [ShowSku] bit NOT NULL,
        [ShowQuantity] bit NOT NULL,
        [ShowDiscountColumn] bit NOT NULL,
        [ShowTaxSummary] bit NOT NULL,
        [ShowShipping] bit NOT NULL,
        [ShowNotes] bit NOT NULL,
        [DefaultTerms] nvarchar(max) NULL,
        [DefaultFooter] nvarchar(max) NULL,
        [IsDefault] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_QuoteTemplates] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SalesQuotas]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SalesQuotas] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [PeriodType] nvarchar(20) NOT NULL,
        [FiscalYear] int NOT NULL,
        [PeriodNumber] int NOT NULL,
        [StartDate] datetime2 NOT NULL,
        [EndDate] datetime2 NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [LastModifiedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_SalesQuotas] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_SalesQuotas_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CampaignStepExecutionLogs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[CampaignStepExecutionLogs] (
        [Id] int NOT NULL IDENTITY,
        [CampaignId] int NOT NULL,
        [StepId] int NOT NULL,
        [RecipientId] int NOT NULL,
        [ContactId] int NULL,
        [Email] nvarchar(max) NOT NULL,
        [ExecutedAt] datetime2 NOT NULL,
        [Status] nvarchar(max) NOT NULL,
        [ErrorMessage] nvarchar(max) NULL,
        CONSTRAINT [PK_CampaignStepExecutionLogs] PRIMARY KEY ([Id])
    );
END;
