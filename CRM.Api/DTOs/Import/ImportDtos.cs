using System.Collections.Generic;

namespace CRM.Api.DTOs.Import
{
    public class ImportPreviewResponse
    {
        public string FileToken { get; set; } = string.Empty;
        public List<string> Headers { get; set; } = new List<string>();
        public List<Dictionary<string, string>> PreviewRows { get; set; } = new List<Dictionary<string, string>>();
        public int TotalRowsEstimate { get; set; }
    }

    public class ImportMappingRequest
    {
        public string FileToken { get; set; } = string.Empty;
        public string EntityType { get; set; } = "Contact";
        public Dictionary<string, string> FieldMapping { get; set; } = new Dictionary<string, string>(); // Header -> PropertyName
        public bool UpdateExisting { get; set; } = false;
    }

    public class ImportResult
    {
        public int TotalProcessed { get; set; }
        public int SuccessCount { get; set; }
        public int ErrorCount { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public List<string> Skipped { get; set; } = new List<string>();
    }
}
