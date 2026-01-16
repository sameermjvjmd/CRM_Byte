using CRM.Api.Models.Email;

namespace CRM.Api.Services.Email
{
    public interface IEmailService
    {
        // Basic email sending
        Task SendEmailAsync(string to, string subject, string body, bool isHtml = true);
        
        // Email with CC, BCC, and attachments
        Task SendEmailAsync(
            string to, 
            string subject, 
            string body, 
            bool isHtml,
            string? cc,
            string? bcc,
            List<string>? attachmentPaths = null);
        
        // Template-based email
        Task SendEmailWithTemplateAsync(string to, int templateId, Dictionary<string, string> placeholders);
        
        // Record sent email to database
        Task<SentEmail> RecordSentEmailAsync(SentEmail sentEmail);
        
        // Process scheduled emails (called by background job)
        Task ProcessScheduledEmailsAsync();
    }
}
