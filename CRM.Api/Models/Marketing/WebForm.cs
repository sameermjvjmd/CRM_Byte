using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CRM.Api.Models.Marketing
{
    public class WebForm
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string FormFieldsJson { get; set; } = "[]"; // JSON definition of fields: [{ label: "Email", type: "email", required: true }]

        public string SubmitButtonText { get; set; } = "Submit";

        public string SuccessMessage { get; set; } = "Thank you for your submission!";
        
        public string? RedirectUrl { get; set; }

        public int? MarketingListId { get; set; }
        public MarketingList? MarketingList { get; set; }

        public bool CreateContact { get; set; } = true;
        public bool CreateActivity { get; set; } = false;
        
        public int? AssignToUserId { get; set; } // User ID to assign the new lead/contact to

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
