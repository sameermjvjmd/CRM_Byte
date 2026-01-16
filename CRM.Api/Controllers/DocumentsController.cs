using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public DocumentsController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: api/documents?entityType=Contact&entityId=1
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Document>>> GetDocuments(string? entityType, int? entityId)
        {
            var query = _context.Documents.AsQueryable();

            if (!string.IsNullOrEmpty(entityType) && entityId.HasValue)
            {
                switch (entityType.ToLower())
                {
                    case "contact":
                        query = query.Where(d => d.ContactId == entityId);
                        break;
                    case "company":
                        query = query.Where(d => d.CompanyId == entityId);
                        break;
                    case "group":
                        query = query.Where(d => d.GroupId == entityId);
                        break;
                    case "opportunity":
                        query = query.Where(d => d.OpportunityId == entityId);
                        break;
                }
            }

            return await query.OrderByDescending(d => d.UploadedAt).ToListAsync();
        }

        // GET: api/documents/5/download
        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadDocument(int id)
        {
            var document = await _context.Documents.FindAsync(id);
            if (document == null) return NotFound();

            var uploadPath = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            var filePath = Path.Combine(uploadPath, document.StoredFileName);

            if (!System.IO.File.Exists(filePath))
                return NotFound("File on disk not found.");

            var memory = new MemoryStream();
            using (var stream = new FileStream(filePath, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;

            return File(memory, document.ContentType, document.FileName);
        }
        
        // POST: api/documents/upload
        [HttpPost("upload")]
        public async Task<ActionResult<Document>> UploadDocument([FromForm] IFormFile file, [FromForm] string? entityType, [FromForm] int? entityId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file selected.");

            // Ensure uploads directory exists
            var uploadPath = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            var storedFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadPath, storedFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var document = new Document
            {
                FileName = file.FileName,
                StoredFileName = storedFileName,
                ContentType = file.ContentType,
                FileSize = file.Length,
                UploadedAt = DateTime.UtcNow
            };

            // Link to entity
            if (!string.IsNullOrEmpty(entityType) && entityId.HasValue)
            {
                switch (entityType.ToLower())
                {
                    case "contact": document.ContactId = entityId; break;
                    case "company": document.CompanyId = entityId; break;
                    case "group": document.GroupId = entityId; break;
                    case "opportunity": document.OpportunityId = entityId; break;
                }
            }

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(DownloadDocument), new { id = document.Id }, document);
        }

        // DELETE: api/documents/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var document = await _context.Documents.FindAsync(id);
            if (document == null) return NotFound();

            // Delete physical file
            var uploadPath = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            var filePath = Path.Combine(uploadPath, document.StoredFileName);
            
            if (System.IO.File.Exists(filePath))
            {
                try { System.IO.File.Delete(filePath); } catch { /* Log error but continue DB delete */ }
            }

            _context.Documents.Remove(document);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
