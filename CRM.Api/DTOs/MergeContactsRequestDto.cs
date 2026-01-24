using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CRM.Api.DTOs
{
    public class MergeContactsRequestDto
    {
        [Required]
        public int TargetContactId { get; set; }

        [Required]
        public List<int> SourceContactIds { get; set; } = new List<int>();
    }
}
