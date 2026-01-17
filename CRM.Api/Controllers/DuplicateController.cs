using CRM.Api.DTOs.DataQuality;
using CRM.Api.Services.DataQuality;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DuplicateController : ControllerBase
    {
        private readonly IDuplicateService _duplicateService;

        public DuplicateController(IDuplicateService duplicateService)
        {
            _duplicateService = duplicateService;
        }

        [HttpPost("scan")]
        public async Task<IActionResult> Scan([FromBody] DuplicateScanRequest request)
        {
            var result = await _duplicateService.ScanForDuplicatesAsync(request);
            return Ok(result);
        }

        [HttpPost("merge")]
        public async Task<IActionResult> Merge([FromBody] MergeRequest request)
        {
            await _duplicateService.MergeRecordsAsync(request);
            return Ok(new { message = "Merge successful" });
        }
    }
}
