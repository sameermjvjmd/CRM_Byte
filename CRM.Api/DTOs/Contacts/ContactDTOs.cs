namespace CRM.Api.DTOs.Contacts
{
    /// <summary>
    /// DTO for contact email address
    /// </summary>
    public class ContactEmailDto
    {
        public int Id { get; set; }
        public int ContactId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string EmailType { get; set; } = "Work";
        public string? Label { get; set; }
        public bool IsPrimary { get; set; }
        public bool AllowMarketing { get; set; } = true;
        public bool OptedOut { get; set; }
        public bool IsVerified { get; set; }
        public int SortOrder { get; set; }
    }

    /// <summary>
    /// DTO for creating a contact email
    /// </summary>
    public class CreateContactEmailDto
    {
        public string Email { get; set; } = string.Empty;
        public string EmailType { get; set; } = "Work";
        public string? Label { get; set; }
        public bool IsPrimary { get; set; }
        public bool AllowMarketing { get; set; } = true;
    }

    /// <summary>
    /// DTO for updating a contact email
    /// </summary>
    public class UpdateContactEmailDto
    {
        public string? Email { get; set; }
        public string? EmailType { get; set; }
        public string? Label { get; set; }
        public bool? IsPrimary { get; set; }
        public bool? AllowMarketing { get; set; }
        public bool? OptedOut { get; set; }
    }

    /// <summary>
    /// DTO for contact address
    /// </summary>
    public class ContactAddressDto
    {
        public int Id { get; set; }
        public int ContactId { get; set; }
        public string AddressType { get; set; } = "Business";
        public string? Label { get; set; }
        public string? Address1 { get; set; }
        public string? Address2 { get; set; }
        public string? Address3 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? County { get; set; }
        public bool IsPrimary { get; set; }
        public bool IsVerified { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public int SortOrder { get; set; }
        public string? FormattedAddress { get; set; }
        public string? SingleLineAddress { get; set; }
    }

    /// <summary>
    /// DTO for creating a contact address
    /// </summary>
    public class CreateContactAddressDto
    {
        public string AddressType { get; set; } = "Business";
        public string? Label { get; set; }
        public string? Address1 { get; set; }
        public string? Address2 { get; set; }
        public string? Address3 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? County { get; set; }
        public bool IsPrimary { get; set; }
    }

    /// <summary>
    /// DTO for updating a contact address
    /// </summary>
    public class UpdateContactAddressDto
    {
        public string? AddressType { get; set; }
        public string? Label { get; set; }
        public string? Address1 { get; set; }
        public string? Address2 { get; set; }
        public string? Address3 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? County { get; set; }
        public bool? IsPrimary { get; set; }
    }

    /// <summary>
    /// Full contact details DTO including emails and addresses
    /// </summary>
    public class ContactDetailDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? MobilePhone { get; set; }
        public string? Fax { get; set; }
        public string? JobTitle { get; set; }
        public int? CompanyId { get; set; }
        public string? CompanyName { get; set; }
        public string? Salutation { get; set; }
        public string? Department { get; set; }
        public string? Status { get; set; }
        public string? LeadSource { get; set; }
        public string? ContactSource { get; set; }
        public string? Website { get; set; }
        public string? PhotoUrl { get; set; }
        public string? Notes { get; set; }
        public string? ReferredBy { get; set; }
        public string? LastResult { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastModifiedAt { get; set; }

        // Legacy address fields (for backward compatibility)
        public string? Address1 { get; set; }
        public string? Address2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? Zip { get; set; }
        public string? Country { get; set; }

        // Multiple emails and addresses
        public List<ContactEmailDto> Emails { get; set; } = new List<ContactEmailDto>();
        public List<ContactAddressDto> Addresses { get; set; } = new List<ContactAddressDto>();
        public List<int> GroupIds { get; set; } = new List<int>();
    }

    /// <summary>
    /// Type reference for dropdowns
    /// </summary>
    public class TypeReferenceDto
    {
        public string Value { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
    }
}
