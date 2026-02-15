using System.Text.Json;
using backend.Api.Data;
using backend.Api.Entities;
using backend.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Api.Controllers;

[ApiController]
[Route("api/admin/site-translations")]
[Authorize(Roles = "Admin")]
public sealed class AdminSiteTranslationsController : ControllerBase
{
    private static readonly Dictionary<string, string> SectionLabels = new(StringComparer.OrdinalIgnoreCase)
    {
        ["common"] = "Site başlığı / meta",
        ["nav"] = "Menü",
        ["home"] = "Ana sayfa (Hero)",
        ["courses"] = "Kurslar",
        ["certificateSection"] = "Ana sayfa – Sertifika bölümü",
        ["about"] = "Hakkımızda",
        ["projects"] = "Projeler",
        ["projectsList"] = "Proje kartları (başlık, açıklama, konum)",
        ["partners"] = "Ortaklar",
        ["footer"] = "Footer",
        ["auth"] = "Giriş / Kayıt",
        ["admin"] = "Admin panel"
    };

    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;
    private readonly ITranslationApiService _translationApi;

    public AdminSiteTranslationsController(AppDbContext context, IWebHostEnvironment env, ITranslationApiService translationApi)
    {
        _context = context;
        _env = env;
        _translationApi = translationApi;
    }

    private static string KeyToLabel(string key)
    {
        var parts = key.Split('.');
        var section = parts.Length > 0 ? parts[0] : "";
        var suffix = parts.Length > 1 ? string.Join(".", parts.Skip(1)) : key;
        var sectionLabel = SectionLabels.TryGetValue(section, out var l) ? l : section;
        return $"{sectionLabel} – {suffix}";
    }

    /// <summary>
    /// Tüm anahtarların listesi (etiketlerle). Varsayılan tr dosyasından türetilir.
    /// </summary>
    [HttpGet("keys")]
    public IActionResult GetKeys()
    {
        var defaults = SiteTranslationDefaultsLoader.LoadFlattened("tr", _env);
        if (defaults == null || defaults.Count == 0)
            return Ok(new List<object>());

        var list = defaults.Keys.OrderBy(k => k).Select(k => new { key = k, label = KeyToLabel(k) }).ToList();
        return Ok(list);
    }

    /// <summary>
    /// Belirtilen dil için tüm çeviri anahtarlarını, mevcut değer ve referans (kaynak dil) değeriyle döner.
    /// languageCode verilirse dil tamamen bu koda göre bulunur (panel ile site aynı dil kaydını kullanır).
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetByLanguage([FromQuery] int languageId, [FromQuery] int? referenceLanguageId, [FromQuery] string? languageCode, CancellationToken ct)
    {
        Language? lang;
        if (!string.IsNullOrWhiteSpace(languageCode))
        {
            var code = languageCode.Trim().ToLowerInvariant();
            lang = await _context.Languages.FirstOrDefaultAsync(l => l.Code == code, ct);
            if (lang == null) return NotFound(new { message = $"Dil kodu bulunamadı: {code}" });
        }
        else
        {
            lang = await _context.Languages.FindAsync(new object[] { languageId }, ct);
            if (lang == null) return NotFound();
        }

        var refLangId = referenceLanguageId ?? await _context.Languages.OrderBy(l => l.SortOrder).Select(l => l.Id).FirstOrDefaultAsync(ct);
        Dictionary<string, string>? refFlat = null;
        if (refLangId > 0)
        {
            var refLang = await _context.Languages.FindAsync(new object[] { refLangId }, ct);
            if (refLang != null)
            {
                var refDb = await _context.SiteTranslations.Where(st => st.LanguageId == refLangId).ToDictionaryAsync(st => st.Key, st => st.Value, ct);
                refFlat = SiteTranslationDefaultsLoader.LoadFlattened(refLang.Code, _env) ?? new Dictionary<string, string>();
                foreach (var kv in refDb) refFlat[kv.Key] = kv.Value;
            }
        }
        if (refFlat == null)
            refFlat = SiteTranslationDefaultsLoader.LoadFlattened("tr", _env) ?? new Dictionary<string, string>();

        var effectiveLangId = lang.Id;
        var dbRows = await _context.SiteTranslations.Where(st => st.LanguageId == effectiveLangId).ToDictionaryAsync(st => st.Key, st => st.Value, ct);
        var defaultFlat = SiteTranslationDefaultsLoader.LoadFlattened(lang.Code, _env) ?? new Dictionary<string, string>();
        var allKeys = refFlat.Keys.Union(defaultFlat.Keys).Union(dbRows.Keys).Distinct().OrderBy(k => k).ToList();

        var items = allKeys.Select(k =>
        {
            var current = dbRows.TryGetValue(k, out var v) ? v : (defaultFlat.TryGetValue(k, out var d) ? d : null);
            var reference = refFlat.TryGetValue(k, out var r) ? r : null;
            return new { key = k, label = KeyToLabel(k), value = current ?? "", referenceValue = reference ?? "" };
        }).ToList();

        return Ok(new { languageId = effectiveLangId, languageCode = lang.Code, languageName = lang.Name, items });
    }

    /// <summary>
    /// Belirtilen dil için çeviri güncellemeleri. updates: { "home.subtitle": "yeni metin", ... }
    /// languageCode verilirse dil Code ile bulunur (site /api/site-translations/{locale} ile aynı kayda yazar).
    /// </summary>
    [HttpPut]
    public async Task<IActionResult> Update([FromBody] SiteTranslationsUpdateInput? input, CancellationToken ct)
    {
        if (input?.Updates == null || input.Updates.Count == 0)
            return BadRequest(new { message = "Güncelleme verisi gerekli." });

        int languageId;
        if (!string.IsNullOrWhiteSpace(input.LanguageCode))
        {
            var code = input.LanguageCode.Trim().ToLowerInvariant();
            var langByCode = await _context.Languages.FirstOrDefaultAsync(l => l.Code == code, ct);
            if (langByCode == null) return NotFound(new { message = $"Dil kodu bulunamadı: {code}" });
            languageId = langByCode.Id;
        }
        else if (input.LanguageId > 0)
        {
            var lang = await _context.Languages.FindAsync(new object[] { input.LanguageId }, ct);
            if (lang == null) return NotFound();
            languageId = input.LanguageId;
        }
        else
            return BadRequest(new { message = "languageId veya languageCode gerekli." });

        foreach (var kv in input.Updates)
        {
            var key = (kv.Key ?? "").Trim();
            if (string.IsNullOrEmpty(key) || key.Length > 120) continue;
            var value = kv.Value ?? "";
            var existing = await _context.SiteTranslations.FindAsync(new object[] { languageId, key }, ct);
            if (existing != null)
                existing.Value = value;
            else
                _context.SiteTranslations.Add(new SiteTranslation { LanguageId = languageId, Key = key, Value = value });
        }
        await _context.SaveChangesAsync(ct);
        return Ok(new { updated = input.Updates.Count });
    }

    /// <summary>
    /// Hedef dili, kaynak dilin çevirileriyle otomatik doldurur (çeviri API'si ile).
    /// targetLanguageCode verilirse hedef dil Code ile bulunur (panel ile site aynı kayıt).
    /// </summary>
    [HttpPost("auto-fill")]
    public async Task<IActionResult> AutoFill([FromBody] SiteTranslationsAutoFillInput? input, CancellationToken ct)
    {
        if (input == null)
            return BadRequest(new { message = "TargetLanguageId veya TargetLanguageCode gerekli." });

        Language? targetLang;
        if (!string.IsNullOrWhiteSpace(input.TargetLanguageCode))
        {
            var code = input.TargetLanguageCode.Trim().ToLowerInvariant();
            targetLang = await _context.Languages.FirstOrDefaultAsync(l => l.Code == code, ct);
            if (targetLang == null) return NotFound(new { message = $"Dil kodu bulunamadı: {code}" });
        }
        else if (input.TargetLanguageId > 0)
        {
            targetLang = await _context.Languages.FindAsync(new object[] { input.TargetLanguageId }, ct);
            if (targetLang == null) return NotFound();
        }
        else
            return BadRequest(new { message = "TargetLanguageId veya TargetLanguageCode gerekli." });

        var targetLangId = targetLang.Id;

        var sourceLangId = input.SourceLanguageId ?? await _context.Languages.OrderBy(l => l.SortOrder).Select(l => l.Id).FirstOrDefaultAsync(ct);
        var sourceLang = await _context.Languages.FindAsync(new object[] { sourceLangId }, ct);
        if (sourceLang == null) return BadRequest(new { message = "Kaynak dil bulunamadı." });

        var sourceFlat = await GetFlatForLanguageAsync(sourceLangId, sourceLang.Code, ct);
        if (sourceFlat.Count == 0) return BadRequest(new { message = "Kaynak dilde çeviri yok." });

        var existingTarget = await _context.SiteTranslations
            .Where(st => st.LanguageId == targetLangId)
            .ToDictionaryAsync(st => st.Key, st => st, ct);

        var sourceList = sourceFlat.Where(x => !string.IsNullOrWhiteSpace(x.Value)).ToList();
        var chunks = sourceList.Chunk(25).ToList();
        
        var translated = 0;
        var errors = 0;
        string? lastError = null;

        foreach (var chunk in chunks)
        {
            var texts = chunk.Select(x => x.Value).ToList();
            List<string> results;
            try
            {
                results = await _translationApi.TranslateBatchAsync(texts, sourceLang.Code, targetLang.Code, ct);
            }
            catch (Exception ex)
            {
                errors++;
                lastError = ex.Message;
                results = texts; // Fallback to original
            }

            for (int i = 0; i < chunk.Length; i++)
            {
                var kv = chunk[i];
                var key = kv.Key;
                var val = (results.Count > i) ? results[i] : kv.Value;

                if (existingTarget.TryGetValue(key, out var existing))
                    existing.Value = val;
                else
                    _context.SiteTranslations.Add(new SiteTranslation { LanguageId = targetLangId, Key = key, Value = val });
                
                translated++;
            }
            
            // Rate limit prevention: Wait 1 second between chunks
            if (chunks.Count > 1) await Task.Delay(1000, ct);
        }

        await _context.SaveChangesAsync(ct);
        
        var msg = $"{translated} anahtar işlendi.";
        if (errors > 0)
            msg += $" {errors} grup çevrilemedi (API hatası). Son hata: {lastError}";

        return Ok(new { translated, message = msg });
    }

    private async Task<Dictionary<string, string>> GetFlatForLanguageAsync(int languageId, string code, CancellationToken ct)
    {
        var db = await _context.SiteTranslations.Where(st => st.LanguageId == languageId).ToDictionaryAsync(st => st.Key, st => st.Value, ct);
        var defaults = SiteTranslationDefaultsLoader.LoadFlattened(code, _env) ?? new Dictionary<string, string>();
        foreach (var kv in defaults)
            if (!db.ContainsKey(kv.Key)) db[kv.Key] = kv.Value;
        return db;
    }

    public class SiteTranslationsUpdateInput
    {
        public int LanguageId { get; set; }
        public string? LanguageCode { get; set; }
        public Dictionary<string, string> Updates { get; set; } = new();
    }

    public class SiteTranslationsAutoFillInput
    {
        public int TargetLanguageId { get; set; }
        public string? TargetLanguageCode { get; set; }
        public int? SourceLanguageId { get; set; }
    }
}
