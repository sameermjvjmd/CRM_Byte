namespace CRM.Api.Services.Security
{
    public interface ITwoFactorService
    {
        (string Secret, string QrCodeUri) GenerateSetupInfo(string email);
        bool ValidateToken(string secret, string token);
        List<string> GenerateRecoveryCodes();
    }
}
