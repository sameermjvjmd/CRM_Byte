using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CRM.Api.Models.Marketing
{
    public class LandingPage
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Slug { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string Status { get; set; } = "Draft"; // Draft, Published, Archived

        public string? HtmlContent { get; set; } // The full page HTML

        public string? JsonContent { get; set; } // The builder state (JSON)

        public string? Theme { get; set; } // Light, Dark, Custom

        public string? SeoTitle { get; set; }
        public string? SeoDescription { get; set; }

        public int VisitCount { get; set; }
        public int SubmissionCount { get; set; }

        public int? WebFormId { get; set; }
        public WebForm? WebForm { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PublishedAt { get; set; }
        public int CreatedByUserId { get; set; }

        public ICollection<LandingPageSubmission> Submissions { get; set; } = new List<LandingPageSubmission>();
    }
}
