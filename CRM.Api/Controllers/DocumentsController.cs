using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;
using System.Security.Claims;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<DocumentsController> _logger;

        public DocumentsController(ApplicationDbContext context, IWebHostEnvironment env, ILogger<DocumentsController> logger)
        {
            _context = context;
            _env = env;
            _logger = logger;
        }

        private int GetUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdStr, out int uid) ? uid : 0;
        }

        // GET: api/documents?entityType=Contact&entityId=1&category=Contract
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetDocuments(
            string? entityType, 
            int? entityId,
            string? category,
            string? search)
        {
            var query = _context.Documents
                .Where(d => d.ParentDocumentId == null) // Only get latest versions
                .AsQueryable();

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

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(d => d.Category == category);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(d => 
                    d.FileName.Contains(search) || 
                    (d.Description != null && d.Description.Contains(search)) ||
                    (d.Tags != null && d.Tags.Contains(search)));
            }

            var documents = await query
                .OrderByDescending(d => d.UploadedAt)
                .Select(d => new
                {
                    d.Id,
                    d.FileName,
                    d.ContentType,
                    d.FileSize,
                    d.UploadedAt,
                    d.Description,
                    d.Category,
                    d.Tags,
                    d.Version,
                    d.IsPublic,
                    d.AccessCount,
                    d.LastAccessedAt,
                    FormattedFileSize = d.FormattedFileSize,
                    FileExtension = d.FileExtension,
                    IsImage = d.IsImage,
                    IsPdf = d.IsPdf,
                    IsOfficeDoc = d.IsOfficeDoc,
                    VersionCount = _context.Documents.Count(v => v.ParentDocumentId == d.Id)
                })
                .ToListAsync();

            return Ok(documents);
        }

        // GET: api/documents/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetDocument(int id)
        {
            var document = await _context.Documents
                .Where(d => d.Id == id)
                .Select(d => new
                {
                    d.Id,
                    d.FileName,
                    d.StoredFileName,
                    d.ContentType,
                    d.FileSize,
                    d.UploadedAt,
                    d.UploadedByUserId,
                    d.Description,
                    d.Category,
                    d.Tags,
                    d.Version,
                    d.ParentDocumentId,
                    d.IsPublic,
                    d.ExpiresAt,
                    d.AccessCount,
                    d.LastAccessedAt,
                    FormattedFileSize = d.FormattedFileSize,
                    FileExtension = d.FileExtension,
                    IsImage = d.IsImage,
                    IsPdf = d.IsPdf,
                    IsOfficeDoc = d.IsOfficeDoc
                })
                .FirstOrDefaultAsync();

            if (document == null) return NotFound();
            return Ok(document);
        }

        // GET: api/documents/5/versions
        [HttpGet("{id}/versions")]
        public async Task<ActionResult<IEnumerable<object>>> GetDocumentVersions(int id)
        {
            var versions = await _context.Documents
                .Where(d => d.ParentDocumentId == id || d.Id == id)
                .OrderByDescending(d => d.Version)
                .Select(d => new
                {
                    d.Id,
                    d.FileName,
                    d.FileSize,
                    d.Version,
                    d.UploadedAt,
                    d.UploadedByUserId,
                    FormattedFileSize = d.FormattedFileSize
                })
                .ToListAsync();

            return Ok(versions);
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

            // Update access tracking
            document.LastAccessedAt = DateTime.UtcNow;
            document.AccessCount++;
            await _context.SaveChangesAsync();

            var memory = new MemoryStream();
            using (var stream = new FileStream(filePath, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;

            return File(memory, document.ContentType, document.FileName);
        }

        // GET: api/documents/5/preview
        [HttpGet("{id}/preview")]
        public async Task<IActionResult> PreviewDocument(int id)
        {
            var document = await _context.Documents.FindAsync(id);
            if (document == null) return NotFound();

            // Only allow preview for images and PDFs
            if (!document.IsImage && !document.IsPdf)
                return BadRequest("Preview not available for this file type");

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

            return File(memory, document.ContentType);
        }

        // GET: api/documents/categories
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<object>>> GetCategories()
        {
            var categories = await _context.Documents
                .Where(d => d.Category != null)
                .GroupBy(d => d.Category)
                .Select(g => new
                {
                    Name = g.Key,
                    Count = g.Count()
                })
                .OrderByDescending(c => c.Count)
                .ToListAsync();

            return Ok(categories);
        }
        
        // POST: api/documents/upload
        [HttpPost("upload")]
        public async Task<ActionResult<Document>> UploadDocument(
            [FromForm] IFormFile file, 
            [FromForm] string? entityType, 
            [FromForm] int? entityId,
            [FromForm] string? description,
            [FromForm] string? category,
            [FromForm] string? tags)
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
                UploadedAt = DateTime.UtcNow,
                UploadedByUserId = GetUserId(),
                Description = description,
                Category = category,
                Tags = tags,
                Version = 1
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

            return CreatedAtAction(nameof(GetDocument), new { id = document.Id }, document);
        }

        // POST: api/documents/5/new-version
        [HttpPost("{id}/new-version")]
        public async Task<ActionResult<Document>> UploadNewVersion(int id, [FromForm] IFormFile file)
        {
            var parentDoc = await _context.Documents.FindAsync(id);
            if (parentDoc == null) return NotFound();
            if (file == null || file.Length == 0) return BadRequest("No file selected.");

            var uploadPath = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);

            var storedFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadPath, storedFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Create new version
            var newVersion = new Document
            {
                FileName = file.FileName,
                StoredFileName = storedFileName,
                ContentType = file.ContentType,
                FileSize = file.Length,
                UploadedAt = DateTime.UtcNow,
                UploadedByUserId = GetUserId(),
                Description = parentDoc.Description,
                Category = parentDoc.Category,
                Tags = parentDoc.Tags,
                Version = parentDoc.Version + 1,
                ParentDocumentId = id,
                ContactId = parentDoc.ContactId,
                CompanyId = parentDoc.CompanyId,
                GroupId = parentDoc.GroupId,
                OpportunityId = parentDoc.OpportunityId
            };

            _context.Documents.Add(newVersion);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDocument), new { id = newVersion.Id }, newVersion);
        }

        // PUT: api/documents/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDocument(int id, [FromBody] UpdateDocumentDto dto)
        {
            var document = await _context.Documents.FindAsync(id);
            if (document == null) return NotFound();

            document.Description = dto.Description;
            document.Category = dto.Category;
            document.Tags = dto.Tags;
            document.IsPublic = dto.IsPublic;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/documents/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var document = await _context.Documents
                .Include(d => d.Versions)
                .FirstOrDefaultAsync(d => d.Id == id);
                
            if (document == null) return NotFound();

            // Delete physical file
            var uploadPath = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            var filePath = Path.Combine(uploadPath, document.StoredFileName);
            
            if (System.IO.File.Exists(filePath))
            {
                try { System.IO.File.Delete(filePath); } catch { /* Log error but continue DB delete */ }
            }

            // Delete all versions' physical files
            foreach (var version in document.Versions)
            {
                var versionPath = Path.Combine(uploadPath, version.StoredFileName);
                if (System.IO.File.Exists(versionPath))
                {
                    try { System.IO.File.Delete(versionPath); } catch { }
                }
            }

            _context.Documents.Remove(document);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class UpdateDocumentDto
    {
        public string? Description { get; set; }
        public string? Category { get; set; }
        public string? Tags { get; set; }
        public bool IsPublic { get; set; }
    }
}
