using System.Security.Cryptography;
using System.Text;

namespace CRM.Api.Services.Security
{
    public interface IEncryptionService
    {
        string Encrypt(string plainText);
        string Decrypt(string cipherText);
    }

    public class EncryptionService : IEncryptionService
    {
        private readonly byte[] _key;

        public EncryptionService(IConfiguration configuration)
        {
            var keyString = configuration["EncryptionSettings:Key"];
            if (string.IsNullOrEmpty(keyString))
            {
                throw new ArgumentException("Encryption key is missing in configuration.");
            }
            
            // Key must be 32 bytes for AES-256
            // If the string is not 32 bytes, we can pad or hash it. 
            // Here we assume the config value is correct for simplicity, or we check.
            _key = Encoding.UTF8.GetBytes(keyString);
            if (_key.Length != 32)
            {
                // Fallback: Use SHA256 to generate a 32-byte key from any string
                using (var sha256 = SHA256.Create())
                {
                    _key = sha256.ComputeHash(Encoding.UTF8.GetBytes(keyString));
                }
            }
        }

        public string Encrypt(string plainText)
        {
            if (string.IsNullOrEmpty(plainText)) return plainText;

            using (var aes = Aes.Create())
            {
                aes.Key = _key;
                aes.GenerateIV(); // Random IV

                var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);

                using (var msEncrypt = new MemoryStream())
                {
                    // Prepend IV to the stream
                    msEncrypt.Write(aes.IV, 0, aes.IV.Length);

                    using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    using (var swEncrypt = new StreamWriter(csEncrypt))
                    {
                        swEncrypt.Write(plainText);
                    }
                    return Convert.ToBase64String(msEncrypt.ToArray());
                }
            }
        }

        public string Decrypt(string cipherText)
        {
            if (string.IsNullOrEmpty(cipherText)) return cipherText;

            try
            {
                var fullCipher = Convert.FromBase64String(cipherText);

                using (var aes = Aes.Create())
                {
                    aes.Key = _key;
                    
                    // Extract IV
                    var iv = new byte[aes.IV.Length]; // 16 bytes for AES
                    if (fullCipher.Length < iv.Length) throw new ArgumentException("Invalid cipher text");
                    
                    Array.Copy(fullCipher, iv, iv.Length);
                    aes.IV = iv;

                    var encryptor = aes.CreateDecryptor(aes.Key, aes.IV);

                    using (var msDecrypt = new MemoryStream(fullCipher, iv.Length, fullCipher.Length - iv.Length))
                    using (var csDecrypt = new CryptoStream(msDecrypt, encryptor, CryptoStreamMode.Read))
                    using (var srDecrypt = new StreamReader(csDecrypt))
                    {
                        return srDecrypt.ReadToEnd();
                    }
                }
            }
            catch
            {
                // In case of error (e.g. legacy plain text), return as is or empty
                // For migration purposes, if it fails to decrypt, we could assume it's plain text.
                return cipherText;
            }
        }
    }
}
