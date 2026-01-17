using CRM.Api.DTOs.Import;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace CRM.Api.Services.Import
{
    public interface IImportService
    {
        Task<ImportPreviewResponse> UploadAndPreviewAsync(IFormFile file);
        Task<ImportResult> ExecuteImportAsync(ImportMappingRequest request);
    }
}
