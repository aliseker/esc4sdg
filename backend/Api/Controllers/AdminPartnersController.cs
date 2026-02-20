using backend.Api.Data;
using backend.Api.Entities;
using backend.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Api.Controllers;

[ApiController]
[Route("api/admin/partners")]
[Authorize(Roles = "Admin")]
public sealed class AdminPartnersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public AdminPartnersController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        try
        {
            var list = await _context.Partners
                .OrderBy(p => p.SortOrder)
                .Include(p => p.Translations)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Country,
                    p.CountryCode,
                    p.Type,
                    p.Website,
                    p.LogoUrl,
                    p.LogoPosition,
                    p.Role,
                    p.SortOrder,
                    p.CreatedAt,
                    Translations = p.Translations.Select(t => new { t.LanguageId, t.Description })
                })
                .ToListAsync(cancellationToken);
            return Ok(list);
        }
        catch (Exception ex)
        {
            var msg = ex.InnerException?.Message ?? ex.Message;
            return StatusCode(500, new { message = "Veritabanı hatası: " + msg });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
        var p = await _context.Partners
            .Include(x => x.Translations)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (p == null) return NotFound();
        return Ok(new
        {
            p.Id,
            p.Name,
            p.Country,
            p.CountryCode,
            p.Type,
            p.Website,
            p.LogoUrl,
            p.LogoPosition,
            p.Role,
            p.SortOrder,
            p.CreatedAt,
            Translations = p.Translations.Select(t => new { t.LanguageId, t.Description })
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PartnerInput input, CancellationToken cancellationToken)
    {
        try
        {
            if (input == null) return BadRequest(new { message = "Geçersiz istek." });
            var name = (input.Name ?? "").Trim();
            if (string.IsNullOrEmpty(name)) return BadRequest(new { message = "Ad zorunludur." });
            // Removed restrictive DangerousChars check to prevent false positives during copy-paste
            if (input.Website != null && !string.IsNullOrWhiteSpace(input.Website) && !InputSanitizer.IsValidUrl(input.Website.Trim()))
                return BadRequest(new { message = "Web sitesi URL http veya https ile başlamalı." });

            var maxOrder = await _context.Partners.AnyAsync(cancellationToken)
                ? await _context.Partners.MaxAsync(x => x.SortOrder, cancellationToken)
                : -1;

            var p = new Partner
            {
                Name = (input.Name ?? "").Trim(),
                Country = string.IsNullOrWhiteSpace(input.Country) ? "" : (input.Country ?? "").Trim(),
                CountryCode = null,
                Type = null,
                Website = string.IsNullOrWhiteSpace(input.Website) ? null : input.Website.Trim(),
                LogoUrl = string.IsNullOrWhiteSpace(input.LogoUrl) ? null : input.LogoUrl.Trim(),
                LogoPosition = string.IsNullOrWhiteSpace(input.LogoPosition) ? null : input.LogoPosition.Trim(),
                Role = null,
                SortOrder = maxOrder + 1,
                CreatedAt = DateTime.UtcNow
            };
            _context.Partners.Add(p);
            await _context.SaveChangesAsync(cancellationToken);

            if (input.Translations != null && input.Translations.Count > 0)
            {
                var validLanguageIds = await _context.Languages.Select(l => l.Id).ToListAsync(cancellationToken);
                foreach (var t in input.Translations)
                {
                    if (!validLanguageIds.Contains(t.LanguageId)) continue;
                    // Descriptions can contain HTML from rich text editor, so we skip DangerousChars check here
                    _context.PartnerTranslations.Add(new PartnerTranslation { PartnerId = p.Id, LanguageId = t.LanguageId, Description = t.Description ?? "" });
                }
                await _context.SaveChangesAsync(cancellationToken);
            }
            return CreatedAtAction(nameof(Get), new { id = p.Id }, new { id = p.Id });
        }
        catch (Exception ex)
        {
            var msg = ex.InnerException?.Message ?? ex.Message;
            return StatusCode(500, new { message = "Ortak eklenirken hata: " + msg });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] PartnerInput input, CancellationToken cancellationToken)
    {
        if (input == null) return BadRequest(new { message = "Geçersiz istek." });
        var p = await _context.Partners.Include(x => x.Translations).FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (p == null) return NotFound();
        // Removed restrictive DangerousChars check to prevent false positives during copy-paste
        if (input.Website != null && !string.IsNullOrWhiteSpace(input.Website) && !InputSanitizer.IsValidUrl(input.Website.Trim()))
            return BadRequest(new { message = "Web sitesi URL http veya https ile başlamalı." });
        p.Name = input.Name.Trim();
        p.Country = string.IsNullOrWhiteSpace(input.Country) ? "" : input.Country.Trim();
        p.CountryCode = null;
        p.Type = null;
        p.Website = string.IsNullOrWhiteSpace(input.Website) ? null : input.Website.Trim();
        p.LogoUrl = string.IsNullOrWhiteSpace(input.LogoUrl) ? null : input.LogoUrl.Trim();
        p.LogoPosition = string.IsNullOrWhiteSpace(input.LogoPosition) ? null : input.LogoPosition.Trim();
        p.Role = null;
        _context.PartnerTranslations.RemoveRange(p.Translations);
        if (input.Translations != null)
        {
            foreach (var t in input.Translations)
            {
                // Descriptions can contain HTML from rich text editor
                _context.PartnerTranslations.Add(new PartnerTranslation { PartnerId = p.Id, LanguageId = t.LanguageId, Description = t.Description ?? "" });
            }
        }
        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { id = p.Id });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var p = await _context.Partners.Include(x => x.Translations).FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (p == null) return NotFound();
        _context.Partners.Remove(p);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static readonly string[] AllowedImageExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".gif" };

    [HttpPost("upload-logo")]
    public async Task<IActionResult> UploadLogo(IFormFile? file, CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Dosya seçilmedi." });
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrEmpty(ext) || !AllowedImageExtensions.Contains(ext))
            return BadRequest(new { message = "Sadece resim dosyaları (jpg, png, webp, gif, svg) yüklenebilir." });
        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var uploadDir = Path.Combine(webRoot, "uploads", "partners");
        Directory.CreateDirectory(uploadDir);
        var fileName = $"{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(uploadDir, fileName);
        await using (var stream = new FileStream(fullPath, FileMode.Create))
            await file.CopyToAsync(stream, cancellationToken);
        var url = "/uploads/partners/" + fileName;
        return Ok(new { url });
    }

    public class PartnerInput
    {
        public string Name { get; set; } = "";
        public string Country { get; set; } = "";
        public string? CountryCode { get; set; }
        public string? Type { get; set; }
        public string? Website { get; set; }
        public string? LogoUrl { get; set; }
        public string? LogoPosition { get; set; }
        public string? Role { get; set; }
        public int SortOrder { get; set; }
        public List<TranslationInput>? Translations { get; set; }
    }

    public class TranslationInput
    {
        public int LanguageId { get; set; }
        public string? Description { get; set; }
    }
}
