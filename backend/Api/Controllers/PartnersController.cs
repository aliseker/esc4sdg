using backend.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class PartnersController : ControllerBase
{
    private readonly AppDbContext _context;

    public PartnersController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] string? lang, CancellationToken cancellationToken)
    {
        var languageId = await ResolveLanguageIdAsync(lang ?? "tr", cancellationToken);
        var enId = await GetLanguageIdByCodeAsync("en", cancellationToken);
        var trId = await GetLanguageIdByCodeAsync("tr", cancellationToken);

        var list = await _context.Partners
            .OrderBy(p => p.SortOrder)
            .Include(p => p.Translations)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Country,
                p.Website,
                p.LogoUrl,
                p.LogoPosition,
                Description = p.Translations.FirstOrDefault(t => t.LanguageId == languageId).Description
                              ?? p.Translations.FirstOrDefault(t => t.LanguageId == enId).Description
                              ?? p.Translations.FirstOrDefault(t => t.LanguageId == trId).Description
                              ?? p.Translations.FirstOrDefault().Description
            })
            .ToListAsync(cancellationToken);
        return Ok(list);
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
