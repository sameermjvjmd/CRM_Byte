using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CRM.Api.Models
{
    public class Document
    {
        public int Id { get; set; }

        [Required]
        public string FileName { get; set; } = string.Empty;

        [Required]
        public string StoredFileName { get; set; } = string.Empty; // Guid-based name on disk

        public string ContentType { get; set; } = "application/octet-stream";
        public long FileSize { get; set; }

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        public int? UploadedByUserId { get; set; }

        // Enhanced features
        public string? Description { get; set; }
        public string? Category { get; set; } // e.g., "Contract", "Proposal", "Invoice", "Marketing"
        public string? Tags { get; set; } // Comma-separated tags
        
        // Version control
        public int Version { get; set; } = 1;
        public int? ParentDocumentId { get; set; } // For version history
        public Document? ParentDocument { get; set; }
        public ICollection<Document> Versions { get; set; } = new List<Document>();
        
        // Sharing
        public bool IsPublic { get; set; } = false;
        public DateTime? ExpiresAt { get; set; }
        
        // Metadata
        public DateTime? LastAccessedAt { get; set; }
        public int AccessCount { get; set; } = 0;

        // Relationships (Optional links to entities)
        public int? ContactId { get; set; }
        public Contact? Contact { get; set; }

        public int? CompanyId { get; set; }
        public Company? Company { get; set; }

        public int? GroupId { get; set; }
        public Group? Group { get; set; }

        public int? OpportunityId { get; set; }
        public Opportunity? Opportunity { get; set; }
        
        [NotMapped]
        public string FormattedFileSize
        {
            get
            {
                string[] sizes = { "B", "KB", "MB", "GB" };
                double len = FileSize;
                int order = 0;
                while (len >= 1024 && order < sizes.Length - 1)
                {
                    order++;
                    len = len / 1024;
                }
                return $"{len:0.##} {sizes[order]}";
            }
        }
        
        [NotMapped]
        public string FileExtension => Path.GetExtension(FileName).ToLower();
        
        [NotMapped]
        public bool IsImage => new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" }.Contains(FileExtension);
        
        [NotMapped]
        public bool IsPdf => FileExtension == ".pdf";
        
        [NotMapped]
        public bool IsOfficeDoc => new[] { ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx" }.Contains(FileExtension);
    }
}
