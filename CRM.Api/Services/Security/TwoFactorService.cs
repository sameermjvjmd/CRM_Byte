using Google.Authenticator;
using System.Text;

namespace CRM.Api.Services.Security
{
    public class TwoFactorService : ITwoFactorService
    {
        private const string IssuerName = "Relavo CRM";

        public (string Secret, string QrCodeUri) GenerateSetupInfo(string email)
        {
            var tfa = new TwoFactorAuthenticator();
            // Use a 16-character string as the internal secret (at least 80 bits recommended)
            var internalSecret = Guid.NewGuid().ToString().Replace("-", "").Substring(0, 16);
            var setupInfo = tfa.GenerateSetupCode(IssuerName, email, internalSecret, false, 3);
            
            // Generate the standard otpauth URI for the QR code (compatible with all apps)
            var qrCodeUri = $"otpauth://totp/{Uri.EscapeDataString(IssuerName)}:{Uri.EscapeDataString(email)}?secret={setupInfo.ManualEntryKey}&issuer={Uri.EscapeDataString(IssuerName)}";
            
            // Return the manual entry key (Base32) as the secret to the user
            return (setupInfo.ManualEntryKey, qrCodeUri);
        }

        public bool ValidateToken(string secret, string token)
        {
            if (string.IsNullOrEmpty(secret) || string.IsNullOrEmpty(token)) return false;

            var tfa = new TwoFactorAuthenticator();
            // Since we return/store the ManualEntryKey (Base32), we must validate it as Base32
            return tfa.ValidateTwoFactorPIN(secret, token, true);
        }

        public List<string> GenerateRecoveryCodes()
        {
            var codes = new List<string>();
            for (int i = 0; i < 8; i++)
            {
                codes.Add(BitConverter.ToString(Guid.NewGuid().ToByteArray()).Replace("-", "").Substring(0, 10).ToUpper());
            }
            return codes;
        }
    }
}
