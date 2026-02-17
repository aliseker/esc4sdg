using backend.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ProjectsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProjectsController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] string? lang, CancellationToken cancellationToken)
    {
        var languageId = await ResolveLanguageIdAsync(lang ?? "tr", cancellationToken);
        var enId = await GetLanguageIdByCodeAsync("en", cancellationToken);
        var trId = await GetLanguageIdByCodeAsync("tr", cancellationToken);

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
                Title = p.Translations.Where(t => t.LanguageId == languageId && !string.IsNullOrWhiteSpace(t.Title)).Select(t => t.Title).FirstOrDefault()
                        ?? p.Translations.Where(t => t.LanguageId == enId && !string.IsNullOrWhiteSpace(t.Title)).Select(t => t.Title).FirstOrDefault()
                        ?? p.Translations.Where(t => t.LanguageId == trId && !string.IsNullOrWhiteSpace(t.Title)).Select(t => t.Title).FirstOrDefault()
                        ?? p.Translations.Where(t => !string.IsNullOrWhiteSpace(t.Title)).Select(t => t.Title).FirstOrDefault() ?? "",
                Subtitle = p.Translations.Where(t => t.LanguageId == languageId && !string.IsNullOrWhiteSpace(t.Subtitle)).Select(t => t.Subtitle).FirstOrDefault()
                        ?? p.Translations.Where(t => t.LanguageId == enId && !string.IsNullOrWhiteSpace(t.Subtitle)).Select(t => t.Subtitle).FirstOrDefault()
                        ?? p.Translations.Where(t => t.LanguageId == trId && !string.IsNullOrWhiteSpace(t.Subtitle)).Select(t => t.Subtitle).FirstOrDefault()
                        ?? p.Translations.Where(t => !string.IsNullOrWhiteSpace(t.Subtitle)).Select(t => t.Subtitle).FirstOrDefault() ?? "",
                GalleryImages = p.GalleryImages.Select(g => new { g.Id, g.ImageUrl, g.SortOrder, g.Caption }).ToList()
            })
            .ToListAsync(cancellationToken);

        return Ok(list);
    }

    [HttpGet("by-slug/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, [FromQuery] string? lang, CancellationToken cancellationToken)
    {
        var languageId = await ResolveLanguageIdAsync(lang ?? "tr", cancellationToken);
        var enId = await GetLanguageIdByCodeAsync("en", cancellationToken);
        var trId = await GetLanguageIdByCodeAsync("tr", cancellationToken);

        var p = await _context.Projects
            .Include(x => x.Translations)
            .Include(x => x.GalleryImages.OrderBy(g => g.SortOrder))
            .FirstOrDefaultAsync(x => x.Slug == slug, cancellationToken);
        if (p == null) return NotFound();

        var t = p.Translations.FirstOrDefault(t => t.LanguageId == languageId && !string.IsNullOrWhiteSpace(t.Title))
                ?? p.Translations.FirstOrDefault(t => t.LanguageId == enId && !string.IsNullOrWhiteSpace(t.Title))
                ?? p.Translations.FirstOrDefault(t => t.LanguageId == trId && !string.IsNullOrWhiteSpace(t.Title))
                ?? p.Translations.FirstOrDefault(t => !string.IsNullOrWhiteSpace(t.Title));

        return Ok(new
        {
            p.Id,
            p.Slug,
            p.CoverImageUrl,
            p.SortOrder,
            p.CreatedAt,
            p.UpdatedAt,
            Title = t?.Title ?? "",
            Subtitle = t?.Subtitle,
            BodyHtml = t?.BodyHtml,
            GalleryImages = p.GalleryImages.Select(g => new { g.Id, g.ImageUrl, g.SortOrder, g.Caption }).ToList()
        });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, [FromQuery] string? lang, CancellationToken cancellationToken)
    {
        var languageId = await ResolveLanguageIdAsync(lang ?? "tr", cancellationToken);
        var enId = await GetLanguageIdByCodeAsync("en", cancellationToken);
        var trId = await GetLanguageIdByCodeAsync("tr", cancellationToken);

        var p = await _context.Projects
            .Include(x => x.Translations)
            .Include(x => x.GalleryImages.OrderBy(g => g.SortOrder))
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (p == null) return NotFound();

        var t = p.Translations.FirstOrDefault(t => t.LanguageId == languageId && !string.IsNullOrWhiteSpace(t.Title))
                ?? p.Translations.FirstOrDefault(t => t.LanguageId == enId && !string.IsNullOrWhiteSpace(t.Title))
                ?? p.Translations.FirstOrDefault(t => t.LanguageId == trId && !string.IsNullOrWhiteSpace(t.Title))
                ?? p.Translations.FirstOrDefault(t => !string.IsNullOrWhiteSpace(t.Title));

        return Ok(new
        {
            p.Id,
            p.Slug,
            p.CoverImageUrl,
            p.SortOrder,
            p.CreatedAt,
            p.UpdatedAt,
            Title = t?.Title ?? "",
            Subtitle = t?.Subtitle,
            BodyHtml = t?.BodyHtml,
            GalleryImages = p.GalleryImages.Select(g => new { g.Id, g.ImageUrl, g.SortOrder, g.Caption }).ToList()
        });
    }

    private async Task<int> ResolveLanguageIdAsync(string code, CancellationToken ct)
    {
        var language = await _context.Languages.FirstOrDefaultAsync(l => l.Code == code, ct);
        return language?.Id ?? await _context.Languages.OrderBy(l => l.SortOrder).Select(l => l.Id).FirstAsync(ct);
    }

    private async Task<int?> GetLanguageIdByCodeAsync(string code, CancellationToken ct)
    {
        var language = await _context.Languages.FirstOrDefaultAsync(l => l.Code == code, ct);
        return language?.Id;
    }
}
