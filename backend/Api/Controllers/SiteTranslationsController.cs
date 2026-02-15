using System.Text.Json;
using backend.Api.Data;
using backend.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Api.Controllers;

[ApiController]
[Route("api/site-translations")]
public sealed class SiteTranslationsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public SiteTranslationsController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    /// <summary>
    /// Locale'e göre site çevirilerini döner (next-intl messages formatında).
    /// Önce DB'deki kayıtlar, yoksa varsayılan dosyadan (DefaultMessages/{code}.json) yüklenir.
    /// </summary>
    [HttpGet("{locale}")]
    public async Task<IActionResult> GetByLocale(string locale, CancellationToken cancellationToken)
    {
        var code = (locale ?? "").Trim().ToLowerInvariant();
        if (string.IsNullOrEmpty(code))
            return BadRequest();

        var lang = await _context.Languages.FirstOrDefaultAsync(l => l.Code == code, cancellationToken);
        var flat = new Dictionary<string, string>();

        if (lang != null)
        {
            var dbRows = await _context.SiteTranslations
                .Where(st => st.LanguageId == lang.Id)
                .ToDictionaryAsync(st => st.Key, st => st.Value, cancellationToken);
            if (dbRows.Count > 0)
            {
                foreach (var kv in dbRows)
                    flat[kv.Key] = kv.Value;
            }
        }

        if (flat.Count == 0)
        {
            var defaults = SiteTranslationDefaultsLoader.LoadFlattened(code, _env);
            if (defaults != null)
                flat = defaults;
        }
        else
        {
            var defaults = SiteTranslationDefaultsLoader.LoadFlattened(code, _env);
            if (defaults != null)
            {
                foreach (var kv in defaults)
                {
                    if (!flat.ContainsKey(kv.Key))
                        flat[kv.Key] = kv.Value;
                }
            }
        }

        if (flat.Count == 0)
            return NotFound();

        var nested = SiteTranslationHelper.UnflattenToNestedObject(flat);
        return Ok(nested);
    }
}
