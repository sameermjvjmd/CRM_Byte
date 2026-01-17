using CRM.Api.DTOs.Reporting;

namespace CRM.Api.Services.Reporting
{
    public interface IReportBuilderService
    {
        Task<ReportResultDto> ExecuteReportAsync(ReportRunRequestDto request, int userId);
        Task<IEnumerable<SavedReportDto>> GetSavedReportsAsync(int userId, bool includePublic = true);
        Task<SavedReportDto?> GetSavedReportAsync(int id);
        Task<SavedReportDto> CreateSavedReportAsync(int userId, CreateSavedReportDto dto);
        Task<bool> DeleteSavedReportAsync(int id, int userId);
    }
}
