using System.ComponentModel.DataAnnotations;
using backend.Api.Data;
using backend.Api.Entities;
using backend.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Api.Controllers;

[ApiController]
[Route("api/admin/projects")]
[Authorize(Roles = "Admin")]
public sealed class AdminProjectsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public AdminProjectsController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    private static readonly string[] AllowedImageExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
    private const int MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var list = await _context.Projects
            .OrderBy(p => p.SortOrder)
            .ThenByDescending(p => p.CreatedAt)
            .Include(p => p.Translations)
            .Include(p => p.GalleryImages.OrderBy(g => g.SortOrder))
            .Select(p => new
            {
                p.Id,
                p.Slug,
                p.CoverImageUrl,
                p.SortOrder,
                p.CreatedAt,
                p.UpdatedAt,
                Translations = p.Translations.Select(t => new { t.LanguageId, t.Title, t.Subtitle }),
                GalleryCount = p.GalleryImages.Count
            })
            .ToListAsync(cancellationToken);
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
        var p = await _context.Projects
            .Include(x => x.Translations)
            .Include(x => x.GalleryImages.OrderBy(g => g.SortOrder))
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (p == null) return NotFound();
        return Ok(new
        {
            p.Id,
            p.Slug,
            p.CoverImageUrl,
            p.SortOrder,
            p.CreatedAt,
            p.UpdatedAt,
            Translations = p.Translations.Select(t => new { t.LanguageId, t.Title, t.Subtitle, t.BodyHtml }),
            GalleryImages = p.GalleryImages.Select(g => new { g.Id, g.ImageUrl, g.SortOrder, g.Caption })
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProjectInput input, CancellationToken cancellationToken)
    {
        if (input == null) return BadRequest(new { message = "Geçersiz istek." });
        var slug = (input.Slug ?? "").Trim().ToLowerInvariant();
        if (string.IsNullOrEmpty(slug)) return BadRequest(new { message = "Slug zorunludur." });
        if (InputSanitizer.ContainsDangerousChars(slug) || (input.CoverImageUrl != null && InputSanitizer.ContainsDangerousChars(input.CoverImageUrl)))
            return BadRequest(new { message = "Geçersiz karakter." });

        if (await _context.Projects.AnyAsync(x => x.Slug == slug, cancellationToken))
            return BadRequest(new { message = "Bu slug zaten kullanılıyor." });

        var maxOrder = await _context.Projects.AnyAsync(cancellationToken)
            ? await _context.Projects.MaxAsync(x => x.SortOrder, cancellationToken)
            : -1;

        var project = new Project
        {
            Slug = slug,
            CoverImageUrl = string.IsNullOrWhiteSpace(input.CoverImageUrl) ? null : input.CoverImageUrl.Trim(),
            SortOrder = input.SortOrder ?? maxOrder + 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Projects.Add(project);
        await _context.SaveChangesAsync(cancellationToken);

        await UpsertTranslationsAsync(project.Id, input.Translations, cancellationToken);
        await UpsertGalleryAsync(project.Id, input.GalleryImages, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(Get), new { id = project.Id }, new { id = project.Id });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] ProjectInput input, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .Include(p => p.Translations)
            .Include(p => p.GalleryImages)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (project == null) return NotFound();
        if (input == null) return BadRequest(new { message = "Geçersiz istek." });

        var slug = (input.Slug ?? "").Trim().ToLowerInvariant();
        if (string.IsNullOrEmpty(slug)) return BadRequest(new { message = "Slug zorunludur." });
        if (InputSanitizer.ContainsDangerousChars(slug))
            return BadRequest(new { message = "Geçersiz karakter." });
        if (await _context.Projects.AnyAsync(x => x.Slug == slug && x.Id != id, cancellationToken))
            return BadRequest(new { message = "Bu slug zaten kullanılıyor." });

        project.Slug = slug;
        project.CoverImageUrl = string.IsNullOrWhiteSpace(input.CoverImageUrl) ? null : input.CoverImageUrl.Trim();
        if (input.SortOrder.HasValue) project.SortOrder = input.SortOrder.Value;
        project.UpdatedAt = DateTime.UtcNow;

        _context.ProjectTranslations.RemoveRange(project.Translations);
        _context.ProjectGalleryImages.RemoveRange(project.GalleryImages);
        await _context.SaveChangesAsync(cancellationToken);

        await UpsertTranslationsAsync(project.Id, input.Translations, cancellationToken);
        await UpsertGalleryAsync(project.Id, input.GalleryImages, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { id = project.Id });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var project = await _context.Projects.FindAsync(new object[] { id }, cancellationToken);
        if (project == null) return NotFound();
        _context.Projects.Remove(project);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPost("upload-cover")]
    public async Task<IActionResult> UploadCover(IFormFile? file, CancellationToken cancellationToken)
    {
        return await SaveProjectImageAsync(file, "projects", cancellationToken);
    }

    [HttpPost("upload-gallery")]
    public async Task<IActionResult> UploadGallery(IFormFile? file, CancellationToken cancellationToken)
    {
        return await SaveProjectImageAsync(file, "projects/gallery", cancellationToken);
    }

    [HttpPost("upload-inline")]
    public async Task<IActionResult> UploadInline(IFormFile? file, CancellationToken cancellationToken)
    {
        return await SaveProjectImageAsync(file, "projects/inline", cancellationToken);
    }

    private async Task<IActionResult> SaveProjectImageAsync(IFormFile? file, string subDir, CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Dosya seçilmedi." });
        if (file.Length > MaxFileSizeBytes)
            return BadRequest(new { message = "Dosya en fazla 5 MB olabilir." });
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrEmpty(ext) || !AllowedImageExtensions.Contains(ext))
            return BadRequest(new { message = "Sadece resim dosyaları (jpg, png, webp, gif) yüklenebilir." });

        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var uploadDir = Path.Combine(webRoot, "uploads", subDir);
        Directory.CreateDirectory(uploadDir);
        var fileName = $"{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(uploadDir, fileName);
        await using (var stream = new FileStream(fullPath, FileMode.Create))
            await file.CopyToAsync(stream, cancellationToken);
        var url = "/uploads/" + subDir + "/" + fileName;
        return Ok(new { url });
    }

    private async Task UpsertTranslationsAsync(int projectId, List<ProjectTranslationInput>? translations, CancellationToken ct)
    {
        if (translations == null) return;
        var validLanguageIds = await _context.Languages.Select(l => l.Id).ToListAsync(ct);
        foreach (var t in translations)
        {
            if (!validLanguageIds.Contains(t.LanguageId)) continue;
            var title = (t.Title ?? "").Trim();
            if (string.IsNullOrEmpty(title)) continue;
            _context.ProjectTranslations.Add(new ProjectTranslation
            {
                ProjectId = projectId,
                LanguageId = t.LanguageId,
                Title = title,
                Subtitle = string.IsNullOrWhiteSpace(t.Subtitle) ? null : t.Subtitle.Trim(),
                BodyHtml = string.IsNullOrWhiteSpace(t.BodyHtml) ? null : t.BodyHtml.Trim()
            });
        }
    }

    private async Task UpsertGalleryAsync(int projectId, List<ProjectGalleryItemInput>? items, CancellationToken ct)
    {
        if (items == null || items.Count == 0) return;
        var order = 0;
        foreach (var g in items)
        {
            if (string.IsNullOrWhiteSpace(g.ImageUrl)) continue;
            _context.ProjectGalleryImages.Add(new ProjectGalleryImage
            {
                ProjectId = projectId,
                ImageUrl = g.ImageUrl.Trim(),
                SortOrder = order++,
                Caption = string.IsNullOrWhiteSpace(g.Caption) ? null : g.Caption.Trim()
            });
        }
    }

    public class ProjectInput
    {
        [Required]
        public string Slug { get; set; } = "";
        public string? CoverImageUrl { get; set; }
        public int? SortOrder { get; set; }
        public List<ProjectTranslationInput>? Translations { get; set; }
        public List<ProjectGalleryItemInput>? GalleryImages { get; set; }
    }

    public class ProjectTranslationInput
    {
        public int LanguageId { get; set; }
        public string Title { get; set; } = "";
        public string? Subtitle { get; set; }
        public string? BodyHtml { get; set; }
    }

    public class ProjectGalleryItemInput
    {
        public string ImageUrl { get; set; } = "";
        public string? Caption { get; set; }
    }
}
