using System;
using System.Collections.Generic;

namespace CRM.Api.DTOs.Marketing
{
    public class LandingPageDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = "Draft";
        public string? HtmlContent { get; set; }
        public string? JsonContent { get; set; }
        public string? Theme { get; set; }
        public int VisitCount { get; set; }
        public int SubmissionCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public WebFormDto? WebForm { get; set; }
    }

    public class CreateLandingPageDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Slug { get; set; }
    }

    public class UpdateLandingPageDto
    {
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = "Draft";
        public string? HtmlContent { get; set; }
        public string? JsonContent { get; set; }
        public string? Theme { get; set; }
        public WebFormDto? WebForm { get; set; }
    }

    public class WebFormDto
    {
        public int? Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string FormFieldsJson { get; set; } = "[]";
        public string SubmitButtonText { get; set; } = "Submit";
        public string SuccessMessage { get; set; } = "Thank you!";
        public string? RedirectUrl { get; set; }
        public int? MarketingListId { get; set; }
        public bool CreateContact { get; set; }
    }

    public class PageSubmissionDto
    {
        public Dictionary<string, string> Data { get; set; } = new();
    }
}
