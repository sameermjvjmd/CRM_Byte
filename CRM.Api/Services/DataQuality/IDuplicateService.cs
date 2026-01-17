using CRM.Api.DTOs.DataQuality;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CRM.Api.Services.DataQuality
{
    public interface IDuplicateService
    {
        Task<List<DuplicateGroupDto>> ScanForDuplicatesAsync(DuplicateScanRequest request);
        Task MergeRecordsAsync(MergeRequest request);
    }
}
