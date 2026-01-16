using System.ComponentModel.DataAnnotations;

namespace CRM.Api.Models
{
    /// <summary>
    /// Represents a physical address for a contact.
    /// Contacts can have multiple addresses (Business, Home, Shipping, Billing, Other)
    /// </summary>
    public class ContactAddress
    {
        public int Id { get; set; }

        /// <summary>
        /// Contact this address belongs to
        /// </summary>
        public int ContactId { get; set; }
        public Contact? Contact { get; set; }

        /// <summary>
        /// Type of address (Business, Home, Shipping, Billing, Other)
        /// </summary>
        [Required]
        [StringLength(50)]
        public string AddressType { get; set; } = "Business";

        /// <summary>
        /// Display label for this address
        /// </summary>
        [StringLength(100)]
        public string? Label { get; set; }

        /// <summary>
        /// Street address line 1
        /// </summary>
        [StringLength(200)]
        public string? Address1 { get; set; }

        /// <summary>
        /// Street address line 2 (apt, suite, floor, etc.)
        /// </summary>
        [StringLength(200)]
        public string? Address2 { get; set; }

        /// <summary>
        /// Street address line 3
        /// </summary>
        [StringLength(200)]
        public string? Address3 { get; set; }

        /// <summary>
        /// City name
        /// </summary>
        [StringLength(100)]
        public string? City { get; set; }

        /// <summary>
        /// State/Province/Region
        /// </summary>
        [StringLength(100)]
        public string? State { get; set; }

        /// <summary>
        /// Postal/ZIP code
        /// </summary>
        [StringLength(20)]
        public string? PostalCode { get; set; }

        /// <summary>
        /// Country name or code
        /// </summary>
        [StringLength(100)]
        public string? Country { get; set; }

        /// <summary>
        /// County/District
        /// </summary>
        [StringLength(100)]
        public string? County { get; set; }

        /// <summary>
        /// Whether this is the primary address for the contact
        /// </summary>
        public bool IsPrimary { get; set; } = false;

        /// <summary>
        /// Whether this address has been verified
        /// </summary>
        public bool IsVerified { get; set; } = false;

        /// <summary>
        /// Latitude for geocoding
        /// </summary>
        public decimal? Latitude { get; set; }

        /// <summary>
        /// Longitude for geocoding
        /// </summary>
        public decimal? Longitude { get; set; }

        /// <summary>
        /// Sort order for display
        /// </summary>
        public int SortOrder { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        /// <summary>
        /// Formatted address for display
        /// </summary>
        public string FormattedAddress
        {
            get
            {
                var parts = new List<string>();
                if (!string.IsNullOrEmpty(Address1)) parts.Add(Address1);
                if (!string.IsNullOrEmpty(Address2)) parts.Add(Address2);
                
                var cityStateZip = new List<string>();
                if (!string.IsNullOrEmpty(City)) cityStateZip.Add(City);
                if (!string.IsNullOrEmpty(State)) cityStateZip.Add(State);
                if (!string.IsNullOrEmpty(PostalCode)) cityStateZip.Add(PostalCode);
                if (cityStateZip.Any()) parts.Add(string.Join(", ", cityStateZip));
                
                if (!string.IsNullOrEmpty(Country)) parts.Add(Country);
                
                return string.Join("\n", parts);
            }
        }

        /// <summary>
        /// Single line formatted address
        /// </summary>
        public string SingleLineAddress
        {
            get
            {
                var parts = new List<string>();
                if (!string.IsNullOrEmpty(Address1)) parts.Add(Address1);
                if (!string.IsNullOrEmpty(City)) parts.Add(City);
                if (!string.IsNullOrEmpty(State)) parts.Add(State);
                if (!string.IsNullOrEmpty(PostalCode)) parts.Add(PostalCode);
                return string.Join(", ", parts);
            }
        }
    }

    /// <summary>
    /// Standard address types
    /// </summary>
    public static class AddressTypes
    {
        public const string Business = "Business";
        public const string Home = "Home";
        public const string Shipping = "Shipping";
        public const string Billing = "Billing";
        public const string Mailing = "Mailing";
        public const string Other = "Other";

        public static List<string> All => new List<string>
        {
            Business, Home, Shipping, Billing, Mailing, Other
        };
    }
}
