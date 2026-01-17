using System.Collections.Generic;

namespace CRM.Api.DTOs.DataQuality
{
    public class DuplicateScanRequest
    {
        public string EntityType { get; set; } = "Contact"; // "Contact" or "Company"
        public List<string> Fields { get; set; } = new List<string> { "Email" }; // "Email", "Phone", "Name"
        public string Sensitivity { get; set; } = "High"; // "High" (Exact), "Medium", "Low"
    }

    public class DuplicateGroupDto
    {
        public int GroupId { get; set; } // Just an arbitrary ID for the UI
        public double MatchScore { get; set; }
        public List<DuplicateRecordDto> Records { get; set; } = new List<DuplicateRecordDto>();
    }

    public class DuplicateRecordDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Dictionary<string, string> Attributes { get; set; } = new Dictionary<string, string>(); // Key-Value pairs of fields
        public DateTime CreatedAt { get; set; }
    }

    public class MergeRequest
    {
        public string EntityType { get; set; } = "Contact";
        public int MasterRecordId { get; set; }
        public List<int> DuplicateRecordIds { get; set; } = new List<int>();
        // Optional: Field level overrides if we want to pick specific values from duplicates
        // public Dictionary<string, object> FieldOverrides { get; set; } 
    }
}
