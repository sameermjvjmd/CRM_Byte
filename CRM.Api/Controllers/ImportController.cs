using CRM.Api.DTOs.Import;
using CRM.Api.Services.Import;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ImportController : ControllerBase
    {
        private readonly IImportService _importService;

        public ImportController(IImportService importService)
        {
            _importService = importService;
        }

        [HttpPost("preview")]
        public async Task<ActionResult<ImportPreviewResponse>> UploadAndPreview(IFormFile file)
        {
            try
            {
                var result = await _importService.UploadAndPreviewAsync(file);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("execute")]
        public async Task<ActionResult<ImportResult>> ExecuteImport([FromBody] ImportMappingRequest request)
        {
            try
            {
                var result = await _importService.ExecuteImportAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
