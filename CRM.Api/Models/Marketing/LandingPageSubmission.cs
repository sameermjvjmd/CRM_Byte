using System;
using CRM.Api.Models;

namespace CRM.Api.Models.Marketing
{
    public class LandingPageSubmission
    {
        public int Id { get; set; }

        public int LandingPageId { get; set; }
        public LandingPage LandingPage { get; set; }

        public int? ContactId { get; set; }
        public Contact? Contact { get; set; }

        public string SubmittedDataJson { get; set; } = "{}"; // Key-value pairs of form data

        public string? IPAddress { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    }
}
