using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models.Email;
using CRM.Api.DTOs.Email;
using System.Security.Claims;

namespace CRM.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EmailSignaturesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public EmailSignaturesController(ApplicationDbContext context)
    {
        _context = context;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
    }

    // GET: api/EmailSignatures
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmailSignatureDto>>> GetSignatures()
    {
        var userId = GetCurrentUserId();
        
        var signatures = await _context.EmailSignatures
            .Where(s => s.CreatedBy == userId)
            .OrderByDescending(s => s.IsDefault)
            .ThenBy(s => s.Name)
            .ToListAsync();

        var signatureDtos = signatures.Select(s => new EmailSignatureDto
        {
            Id = s.Id,
            Name = s.Name,
            Content = s.Content,
            IsDefault = s.IsDefault,
            CreatedAt = s.CreatedAt,
            UpdatedAt = s.UpdatedAt
        }).ToList();

        return Ok(signatureDtos);
    }

    // GET: api/EmailSignatures/5
    [HttpGet("{id}")]
    public async Task<ActionResult<EmailSignatureDto>> GetSignature(int id)
    {
        var userId = GetCurrentUserId();
        
        var signature = await _context.EmailSignatures
            .Where(s => s.Id == id && s.CreatedBy == userId)
            .FirstOrDefaultAsync();

        if (signature == null)
        {
            return NotFound();
        }

        var signatureDto = new EmailSignatureDto
        {
            Id = signature.Id,
            Name = signature.Name,
            Content = signature.Content,
            IsDefault = signature.IsDefault,
            CreatedAt = signature.CreatedAt,
            UpdatedAt = signature.UpdatedAt
        };

        return Ok(signatureDto);
    }

    // GET: api/EmailSignatures/default
    [HttpGet("default")]
    public async Task<ActionResult<EmailSignatureDto>> GetDefaultSignature()
    {
        var userId = GetCurrentUserId();
        
        var signature = await _context.EmailSignatures
            .Where(s => s.CreatedBy == userId && s.IsDefault)
            .FirstOrDefaultAsync();

        if (signature == null)
        {
            return NotFound(new { message = "No default signature set" });
        }

        var signatureDto = new EmailSignatureDto
        {
            Id = signature.Id,
            Name = signature.Name,
            Content = signature.Content,
            IsDefault = signature.IsDefault,
            CreatedAt = signature.CreatedAt,
            UpdatedAt = signature.UpdatedAt
        };

        return Ok(signatureDto);
    }

    // POST: api/EmailSignatures
    [HttpPost]
    public async Task<ActionResult<EmailSignatureDto>> CreateSignature(CreateEmailSignatureDto createDto)
    {
        var userId = GetCurrentUserId();

        // If this is marked as default, unset other defaults
        if (createDto.IsDefault)
        {
            var existingDefaults = await _context.EmailSignatures
                .Where(s => s.CreatedBy == userId && s.IsDefault)
                .ToListAsync();
            
            foreach (var sig in existingDefaults)
            {
                sig.IsDefault = false;
            }
        }

        var signature = new EmailSignature
        {
            Name = createDto.Name,
            Content = createDto.Content,
            IsDefault = createDto.IsDefault,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.EmailSignatures.Add(signature);
        await _context.SaveChangesAsync();

        var signatureDto = new EmailSignatureDto
        {
            Id = signature.Id,
            Name = signature.Name,
            Content = signature.Content,
            IsDefault = signature.IsDefault,
            CreatedAt = signature.CreatedAt,
            UpdatedAt = signature.UpdatedAt
        };

        return CreatedAtAction(nameof(GetSignature), new { id = signature.Id }, signatureDto);
    }

    // PUT: api/EmailSignatures/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSignature(int id, UpdateEmailSignatureDto updateDto)
    {
        var userId = GetCurrentUserId();
        
        var signature = await _context.EmailSignatures
            .Where(s => s.Id == id && s.CreatedBy == userId)
            .FirstOrDefaultAsync();

        if (signature == null)
        {
            return NotFound();
        }

        // If this is being set as default, unset other defaults
        if (updateDto.IsDefault && !signature.IsDefault)
        {
            var existingDefaults = await _context.EmailSignatures
                .Where(s => s.CreatedBy == userId && s.IsDefault && s.Id != id)
                .ToListAsync();
            
            foreach (var sig in existingDefaults)
            {
                sig.IsDefault = false;
            }
        }

        signature.Name = updateDto.Name;
        signature.Content = updateDto.Content;
        signature.IsDefault = updateDto.IsDefault;
        signature.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PUT: api/EmailSignatures/5/set-default
    [HttpPut("{id}/set-default")]
    public async Task<IActionResult> SetDefaultSignature(int id)
    {
        var userId = GetCurrentUserId();
        
        var signature = await _context.EmailSignatures
            .Where(s => s.Id == id && s.CreatedBy == userId)
            .FirstOrDefaultAsync();

        if (signature == null)
        {
            return NotFound();
        }

        // Unset all other defaults
        var existingDefaults = await _context.EmailSignatures
            .Where(s => s.CreatedBy == userId && s.IsDefault && s.Id != id)
            .ToListAsync();
        
        foreach (var sig in existingDefaults)
        {
            sig.IsDefault = false;
        }

        signature.IsDefault = true;
        signature.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/EmailSignatures/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSignature(int id)
    {
        var userId = GetCurrentUserId();
        
        var signature = await _context.EmailSignatures
            .Where(s => s.Id == id && s.CreatedBy == userId)
            .FirstOrDefaultAsync();

        if (signature == null)
        {
            return NotFound();
        }

        _context.EmailSignatures.Remove(signature);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
