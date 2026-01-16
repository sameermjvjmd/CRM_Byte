using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CRM.Api.Models.Marketing
{
    // =============================================
    // Marketing Campaign
    // =============================================
    public class MarketingCampaign
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string? Description { get; set; }

        [StringLength(50)]
        public string Type { get; set; } = "Email"; // Email, SMS, Social, Drip
        
        [StringLength(50)]
        public string Status { get; set; } = "Draft"; // Draft, Scheduled, Active, Paused, Completed, Cancelled
        
        // Content
        [StringLength(500)]
        public string? Subject { get; set; }
        public string? HtmlContent { get; set; }
        public string? PlainTextContent { get; set; }
        public int? TemplateId { get; set; }
        
        // Recipients
        public int? MarketingListId { get; set; }
        public MarketingList? MarketingList { get; set; }
        
        // Scheduling
        public DateTime? ScheduledFor { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        
        [StringLength(100)]
        public string? Timezone { get; set; }
        
        // A/B Testing
        public bool IsABTest { get; set; } = false;
        [StringLength(500)]
        public string? VariantASubject { get; set; }
        public string? VariantAContent { get; set; }
        [StringLength(500)]
        public string? VariantBSubject { get; set; }
        public string? VariantBContent { get; set; }
        public int ABTestSamplePercentage { get; set; } = 20; // % of list used for testing
        public int? WinningVariant { get; set; } // 1=A, 2=B, null=not determined
        
        // Stats
        public int RecipientCount { get; set; } = 0;
        public int SentCount { get; set; } = 0;
        public int DeliveredCount { get; set; } = 0;
        public int OpenCount { get; set; } = 0;
        public int UniqueOpenCount { get; set; } = 0;
        public int ClickCount { get; set; } = 0;
        public int UniqueClickCount { get; set; } = 0;
        public int BounceCount { get; set; } = 0;
        public int UnsubscribeCount { get; set; } = 0;
        public int SpamReportCount { get; set; } = 0;
        
        // ROI Tracking
        [Column(TypeName = "decimal(18,2)")]
        public decimal? Budget { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? Revenue { get; set; }
        
        public int? ConversionCount { get; set; }
        
        // Metadata
        public int CreatedByUserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        [StringLength(1000)]
        public string? Tags { get; set; } // JSON array
        
        // Navigation
        public ICollection<CampaignRecipient>? Recipients { get; set; }
    }

    // =============================================
    // Marketing List (Segments)
    // =============================================
    public class MarketingList
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        [StringLength(50)]
        public string Type { get; set; } = "Static"; // Static, Dynamic
        
        [StringLength(50)]
        public string Status { get; set; } = "Active"; // Active, Inactive, Archived
        
        // Dynamic list criteria (JSON)
        public string? DynamicCriteria { get; set; }
        
        // Member count (cached)
        public int MemberCount { get; set; } = 0;
        
        // GDPR/Compliance
        public bool RequireDoubleOptIn { get; set; } = false;
        
        [StringLength(500)]
        public string? UnsubscribeUrl { get; set; }
        
        // Metadata
        public int CreatedByUserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? LastSyncedAt { get; set; }
        
        // Navigation
        public ICollection<MarketingListMember>? Members { get; set; }
        public ICollection<MarketingCampaign>? Campaigns { get; set; }
    }

    // =============================================
    // Marketing List Member
    // =============================================
    public class MarketingListMember
    {
        public int Id { get; set; }
        
        public int MarketingListId { get; set; }
        public MarketingList? MarketingList { get; set; }
        
        public int? ContactId { get; set; }
        public Contact? Contact { get; set; }
        
        [Required]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;
        
        [StringLength(100)]
        public string? FirstName { get; set; }
        
        [StringLength(100)]
        public string? LastName { get; set; }
        
        [StringLength(50)]
        public string Status { get; set; } = "Subscribed"; // Subscribed, Unsubscribed, Bounced, Cleaned
        
        // Subscription tracking
        public DateTime SubscribedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UnsubscribedAt { get; set; }
        
        [StringLength(100)]
        public string? UnsubscribeReason { get; set; }
        
        // Double opt-in
        public bool IsConfirmed { get; set; } = true;
        public DateTime? ConfirmedAt { get; set; }
        
        [StringLength(100)]
        public string? ConfirmationToken { get; set; }
        
        // Bounce tracking
        public int BounceCount { get; set; } = 0;
        public DateTime? LastBounceAt { get; set; }
        
        [StringLength(50)]
        public string? BounceType { get; set; } // Hard, Soft
        
        // Lead scoring
        public int? LeadScore { get; set; }
        
        // Source
        [StringLength(100)]
        public string? Source { get; set; } // Import, Form, API, Manual
        
        [StringLength(1000)]
        public string? CustomFields { get; set; } // JSON
    }

    // =============================================
    // Campaign Recipient (Send Log)
    // =============================================
    public class CampaignRecipient
    {
        public int Id { get; set; }
        
        public int CampaignId { get; set; }
        public MarketingCampaign? Campaign { get; set; }
        
        [Required]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;
        
        public int? ContactId { get; set; }
        public int? MarketingListMemberId { get; set; }
        
        [StringLength(50)]
        public string Status { get; set; } = "Pending"; // Pending, Sent, Delivered, Opened, Clicked, Bounced, Unsubscribed
        
        // Timestamps
        public DateTime? SentAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
        public DateTime? FirstOpenedAt { get; set; }
        public DateTime? LastOpenedAt { get; set; }
        public DateTime? FirstClickedAt { get; set; }
        public DateTime? LastClickedAt { get; set; }
        public DateTime? BouncedAt { get; set; }
        public DateTime? UnsubscribedAt { get; set; }
        
        // Engagement counts
        public int OpenCount { get; set; } = 0;
        public int ClickCount { get; set; } = 0;
        
        // Click tracking
        [StringLength(2000)]
        public string? ClickedLinks { get; set; } // JSON array of clicked URLs
        
        // Bounce info
        [StringLength(50)]
        public string? BounceType { get; set; }
        
        [StringLength(500)]
        public string? BounceMessage { get; set; }
        
        // A/B Test variant
        public int? Variant { get; set; } // 1=A, 2=B
        
        // Device/Location tracking
        [StringLength(50)]
        public string? DeviceType { get; set; }
        
        [StringLength(100)]
        public string? Location { get; set; }
    }

    // =============================================
    // Suppression List (Global Unsubscribes)
    // =============================================
    public class SuppressionEntry
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;
        
        [StringLength(50)]
        public string Type { get; set; } = "Unsubscribe"; // Unsubscribe, Bounce, Spam, Manual
        
        [StringLength(500)]
        public string? Reason { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public int? CampaignId { get; set; }
    }

    // =============================================
    // Lead Scoring Rule
    // =============================================
    public class LeadScoringRule
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        [StringLength(50)]
        public string Category { get; set; } = "Engagement"; // Engagement, Demographic, Behavior, Email
        
        [StringLength(100)]
        public string TriggerType { get; set; } = "EmailOpen"; // EmailOpen, EmailClick, PageVisit, FormSubmit, etc.
        
        public int PointsValue { get; set; } = 5;
        
        public bool IsActive { get; set; } = true;
        
        // Conditions (JSON)
        public string? Conditions { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    // =============================================
    // Constants
    // =============================================
    public static class CampaignStatuses
    {
        public const string Draft = "Draft";
        public const string Scheduled = "Scheduled";
        public const string Active = "Active";
        public const string Paused = "Paused";
        public const string Completed = "Completed";
        public const string Cancelled = "Cancelled";

        public static readonly string[] All = { Draft, Scheduled, Active, Paused, Completed, Cancelled };
    }

    public static class CampaignTypes
    {
        public const string Email = "Email";
        public const string SMS = "SMS";
        public const string Social = "Social";
        public const string Drip = "Drip";

        public static readonly string[] All = { Email, SMS, Social, Drip };
    }

    public static class ListMemberStatuses
    {
        public const string Subscribed = "Subscribed";
        public const string Unsubscribed = "Unsubscribed";
        public const string Bounced = "Bounced";
        public const string Cleaned = "Cleaned";
        public const string Pending = "Pending";

        public static readonly string[] All = { Subscribed, Unsubscribed, Bounced, Cleaned, Pending };
    }
}
