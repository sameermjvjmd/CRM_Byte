-- Fix Quotes table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Quotes]') AND name = 'QuoteTemplateId')
BEGIN
    ALTER TABLE [dbo].[Quotes] ADD [QuoteTemplateId] int NULL;
END;

-- Fix LeadScoringRules table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[LeadScoringRules]') AND name = 'UpdatedAt')
BEGIN
    ALTER TABLE [dbo].[LeadScoringRules] ADD [UpdatedAt] datetime2 NULL;
END;

-- Fix CampaignSteps table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[CampaignSteps]') AND name = 'ClickCount')
BEGIN
    ALTER TABLE [dbo].[CampaignSteps] ADD [ClickCount] int NOT NULL DEFAULT 0;
END;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[CampaignSteps]') AND name = 'DeliveredCount')
BEGIN
    ALTER TABLE [dbo].[CampaignSteps] ADD [DeliveredCount] int NOT NULL DEFAULT 0;
END;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[CampaignSteps]') AND name = 'OpenCount')
BEGIN
    ALTER TABLE [dbo].[CampaignSteps] ADD [OpenCount] int NOT NULL DEFAULT 0;
END;
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[CampaignSteps]') AND name = 'SentCount')
BEGIN
    ALTER TABLE [dbo].[CampaignSteps] ADD [SentCount] int NOT NULL DEFAULT 0;
END;
