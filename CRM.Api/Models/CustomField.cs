using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace CRM.Api.Models
{
    public class CustomFieldDefinition
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string EntityType { get; set; } = "Contact"; // Contact, Company, Opportunity

        [Required]
        [StringLength(100)]
        public string FieldName { get; set; } = string.Empty; // User visible label

        [Required]
        [StringLength(100)]
        public string FieldKey { get; set; } = string.Empty; // Internal key (slug)

        [Required]
        [StringLength(50)]
        public string FieldType { get; set; } = "Text"; // Text, Number, Date, Checkbox, Select, MultiSelect, URL, Email, Currency

        public bool IsRequired { get; set; } = false;

        public string? OptionsJson { get; set; } // JSON array of options for Select/MultiSelect
        
        public int SortOrder { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class CustomFieldValue
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("CustomFieldDefinition")]
        public int CustomFieldDefinitionId { get; set; }
        public CustomFieldDefinition CustomFieldDefinition { get; set; } = null!;

        public int EntityId { get; set; } // ID of the Contact/Company/Opp

        [StringLength(50)]
        public string EntityType { get; set; } = "Contact";

        // Store value as string primarily
        public string? Value { get; set; }
        
        // Optional: Optimized columns for filtering/sorting
        public decimal? ValueNum { get; set; }
        public DateTime? ValueDate { get; set; }
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
