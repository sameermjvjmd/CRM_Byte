using System.ComponentModel.DataAnnotations;

namespace CRM.Api.DTOs.Marketing
{
    // =============================================
    // Campaign DTOs
    // =============================================
    public class CampaignDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Type { get; set; } = "Email";
        public string Status { get; set; } = "Draft";
        public string? Subject { get; set; }
        public DateTime? ScheduledFor { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int? MarketingListId { get; set; }
        public string? MarketingListName { get; set; }
        public int? TemplateId { get; set; }
        public string? HtmlContent { get; set; }
        public string? PlainTextContent { get; set; }
        
        // Stats
        public int RecipientCount { get; set; }
        public int SentCount { get; set; }
        public int OpenCount { get; set; }
        public int UniqueOpenCount { get; set; }
        public int ClickCount { get; set; }
        public int UniqueClickCount { get; set; }
        public int BounceCount { get; set; }
        public int UnsubscribeCount { get; set; }
        
        // Calculated rates
        public double OpenRate { get; set; }
        public double ClickRate { get; set; }
        public double BounceRate { get; set; }
        public double UnsubscribeRate { get; set; }
        
        // ROI
        public decimal? Budget { get; set; }
        public decimal? Revenue { get; set; }
        public int? ConversionCount { get; set; }
        public double? ROI { get; set; }
        
        // A/B Test
        public bool IsABTest { get; set; }
        public int? WinningVariant { get; set; }
        
        public DateTime CreatedAt { get; set; }
    }

    public class CreateCampaignDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        [StringLength(50)]
        public string Type { get; set; } = "Email";
        
        [StringLength(500)]
        public string? Subject { get; set; }
        
        public string? HtmlContent { get; set; }
        public string? PlainTextContent { get; set; }
        public int? TemplateId { get; set; }
        public int? MarketingListId { get; set; }
        public DateTime? ScheduledFor { get; set; }
        public string? Timezone { get; set; }
        
        // A/B Test
        public bool IsABTest { get; set; } = false;
        public string? VariantASubject { get; set; }
        public string? VariantAContent { get; set; }
        public string? VariantBSubject { get; set; }
        public string? VariantBContent { get; set; }
        public int ABTestSamplePercentage { get; set; } = 20;
        
        // ROI
        public decimal? Budget { get; set; }
    }

    public class UpdateCampaignDto : CreateCampaignDto
    {
        public string Status { get; set; } = "Draft";
        public decimal? Revenue { get; set; }
        public int? ConversionCount { get; set; }
    }

    // =============================================
    // Campaign Step DTOs
    // =============================================
    public class CampaignStepDto
    {
        public int Id { get; set; }
        public int CampaignId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public int DelayMinutes { get; set; }
        public int? TemplateId { get; set; }
        public string? Subject { get; set; }
        public string? HtmlContent { get; set; }
        public string? PlainTextContent { get; set; }
    }

    public class CreateCampaignStepDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        public int DelayMinutes { get; set; }
        public int? TemplateId { get; set; }
        public string? Subject { get; set; }
        public string? HtmlContent { get; set; }
        public string? PlainTextContent { get; set; }
    }

    public class UpdateCampaignStepDto : CreateCampaignStepDto
    {
        public int OrderIndex { get; set; }
    }

    // =============================================
    // Marketing List DTOs
    // =============================================
    public class MarketingListDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Type { get; set; } = "Static";
        public string Status { get; set; } = "Active";
        public int MemberCount { get; set; }
        public int SubscribedCount { get; set; }
        public int UnsubscribedCount { get; set; }
        public int BouncedCount { get; set; }
        public bool RequireDoubleOptIn { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastSyncedAt { get; set; }
    }

    public class CreateMarketingListDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        [StringLength(50)]
        public string Type { get; set; } = "Static";
        
        public string? DynamicCriteria { get; set; }
        public bool RequireDoubleOptIn { get; set; } = false;
        public string? UnsubscribeUrl { get; set; }
    }

    // =============================================
    // List Member DTOs
    // =============================================
    public class ListMemberDto
    {
        public int Id { get; set; }
        public int MarketingListId { get; set; }
        public int? ContactId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string Status { get; set; } = "Subscribed";
        public DateTime SubscribedAt { get; set; }
        public DateTime? UnsubscribedAt { get; set; }
        public bool IsConfirmed { get; set; }
        public int? LeadScore { get; set; }
        public string? Source { get; set; }
    }

    public class AddListMemberDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public int? ContactId { get; set; }
        public string? Source { get; set; }
        public string? CustomFields { get; set; }
    }

    public class BulkAddMembersDto
    {
        public List<AddListMemberDto> Members { get; set; } = new();
        public bool SkipDuplicates { get; set; } = true;
    }

    // =============================================
    // Campaign Analytics DTOs
    // =============================================
    public class CampaignAnalyticsDto
    {
        public int CampaignId { get; set; }
        public string CampaignName { get; set; } = string.Empty;
        
        // Overview
        public int TotalRecipients { get; set; }
        public int Sent { get; set; }
        public int Delivered { get; set; }
        public int Opened { get; set; }
        public int Clicked { get; set; }
        public int Bounced { get; set; }
        public int Unsubscribed { get; set; }
        
        // Rates
        public double DeliveryRate { get; set; }
        public double OpenRate { get; set; }
        public double ClickRate { get; set; }
        public double ClickToOpenRate { get; set; }
        public double BounceRate { get; set; }
        public double UnsubscribeRate { get; set; }
        
        // Timeline
        public List<TimelineDataPoint>? OpensOverTime { get; set; }
        public List<TimelineDataPoint>? ClicksOverTime { get; set; }
        
        // Top links
        public List<LinkStats>? TopLinks { get; set; }
        
        // Device stats
        public List<DeviceStats>? DeviceBreakdown { get; set; }
        
        // A/B Test results
        public ABTestResultDto? ABTestResults { get; set; }

        // Step Analytics (for Drip Campaigns)
        public List<CampaignStepAnalyticsDto>? StepAnalytics { get; set; }
    }

    public class CampaignStepAnalyticsDto
    {
        public int StepId { get; set; }
        public string StepName { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public string Subject { get; set; } = string.Empty;
        public int Sent { get; set; }
        public int Opened { get; set; }
        public int Clicked { get; set; }
        public double OpenRate { get; set; }
        public double ClickRate { get; set; }
    }

    public class TimelineDataPoint
    {
        public DateTime Timestamp { get; set; }
        public int Count { get; set; }
    }

    public class LinkStats
    {
        public string Url { get; set; } = string.Empty;
        public int ClickCount { get; set; }
        public int UniqueClicks { get; set; }
    }

    public class DeviceStats
    {
        public string DeviceType { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public class ABTestResultDto
    {
        public int VariantAOpens { get; set; }
        public int VariantAClicks { get; set; }
        public double VariantAOpenRate { get; set; }
        public double VariantAClickRate { get; set; }
        
        public int VariantBOpens { get; set; }
        public int VariantBClicks { get; set; }
        public double VariantBOpenRate { get; set; }
        public double VariantBClickRate { get; set; }
        
        public int? Winner { get; set; }
        public string? WinnerReason { get; set; }
    }

    // =============================================
    // Lead Scoring DTOs
    // =============================================
    public class LeadScoringRuleDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = "Engagement";
        public string TriggerType { get; set; } = "EmailOpen";
        public int PointsValue { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateLeadScoringRuleDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        public string Category { get; set; } = "Engagement";
        public string TriggerType { get; set; } = "EmailOpen";
        public int PointsValue { get; set; } = 5;
        public string? Conditions { get; set; }
    }

    // =============================================
    // Marketing Dashboard DTOs
    // =============================================
    public class MarketingDashboardDto
    {
        // Overview
        public int TotalCampaigns { get; set; }
        public int ActiveCampaigns { get; set; }
        public int ScheduledCampaigns { get; set; }
        public int TotalSubscribers { get; set; }
        public int NewSubscribersThisMonth { get; set; }
        
        // Email stats
        public long TotalEmailsSent { get; set; }
        public double AvgOpenRate { get; set; }
        public double AvgClickRate { get; set; }
        public double AvgBounceRate { get; set; }
        
        // ROI
        public decimal TotalBudget { get; set; }
        public decimal TotalRevenue { get; set; }
        public double OverallROI { get; set; }
        
        // Recent campaigns
        public List<CampaignDto>? RecentCampaigns { get; set; }
        
        // Top performing campaigns
        public List<CampaignDto>? TopCampaigns { get; set; }
    }
}
