using System.IO;
using backend.Api.Data;
using backend.Api.Entities;
using backend.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Api.Controllers;

[ApiController]
[Route("api/admin/courses")]
[Authorize(Roles = "Admin")]
public sealed class AdminCoursesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public AdminCoursesController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    /// <summary>İçeriklerden toplam süreyi hesaplar: video süresi, yazı okuma süresi, PDF/Quiz varsayılan.</summary>
    private static int ComputeDurationMinutes(CourseFullInput? input)
    {
        if (input?.Modules == null || input.Modules.Count == 0) return 0;
        int totalSeconds = 0;
        foreach (var mod in input.Modules)
        {
            if (mod.Items == null) continue;
            foreach (var item in mod.Items)
            {
                switch (item.Type?.ToLowerInvariant())
                {
                    case "video":
                        if (item.VideoDurationSeconds.HasValue && item.VideoDurationSeconds.Value > 0)
                            totalSeconds += item.VideoDurationSeconds.Value;
                        else
                            totalSeconds += 300; // 5 dk varsayılan
                        break;
                    case "text":
                        var len = item.TextContent?.Length ?? 0;
                        totalSeconds += Math.Max(60, (int)(len / 15.0)); // ~15 karakter/saniye okuma
                        break;
                    case "pdf":
                        totalSeconds += 300; // 5 dk varsayılan
                        break;
                    case "quiz":
                        totalSeconds += 120; // 2 dk varsayılan
                        break;
                }
            }
        }
        return Math.Max(1, (int)Math.Ceiling(totalSeconds / 60.0));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var list = await _context.Courses
            .OrderBy(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.Slug,
                c.Category,
                c.Level,
                c.DurationMinutes,
                c.InstructorName,
                c.HasCertificate,
                ModuleCount = c.Modules.Count,
                LessonCount = c.Modules.SelectMany(m => m.Items).Count(),
                c.CreatedAt
            })
            .ToListAsync(cancellationToken);
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
        var course = await _context.Courses
            .Include(c => c.Translations)
            .Include(c => c.Modules.OrderBy(m => m.SortOrder))
            .ThenInclude(m => m.Translations)
            .Include(c => c.Modules)
            .ThenInclude(m => m.Items.OrderBy(i => i.SortOrder))
            .ThenInclude(i => i.Translations)
            .AsSplitQuery()
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (course == null) return NotFound();

        return Ok(new
        {
            course.Id,
            course.Slug,
            course.Category,
            course.Level,
            course.DurationMinutes,
            course.InstructorName,
            course.ImageUrl,
            course.HasCertificate,
            course.CreatedAt,
            course.UpdatedAt,
            Translations = course.Translations.Select(t => new { t.LanguageId, t.Title, t.Summary, Category = t.Category ?? course.Category, Level = t.Level ?? course.Level }),
            Modules = course.Modules.Select(m => new
            {
                m.Id,
                m.SortOrder,
                Translations = m.Translations.Select(t => new { t.LanguageId, t.Title, t.Description }),
                Items = m.Items.Select(i => new
                {
                    i.Id,
                    i.SortOrder,
                    Type = i.Type.ToString(),
                    i.VideoUrl,
                    i.MustWatch,
                    i.VideoDurationSeconds,
                    i.FilePath,
                    i.TextContent,
                    i.QuizDataJson,
                    i.PassScorePercent,
                    Translations = i.Translations.Select(t => new { t.LanguageId, t.Title })
                })
            })
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CourseFullInput? input, CancellationToken cancellationToken)
    {
        if (input == null)
            return BadRequest(new { message = "Request body is missing or invalid." });
        var slug = InputSanitizer.SanitizeSlug(input.Slug, 200);
        if (string.IsNullOrEmpty(slug))
            return BadRequest(new { message = "Slug is required." });
        if (InputSanitizer.ContainsDangerousChars(input.Category) || InputSanitizer.ContainsDangerousChars(input.Level))
            return BadRequest(new { message = "Geçersiz karakter içeriyor." });
        if (await _context.Courses.AnyAsync(c => c.Slug == slug, cancellationToken))
            return Conflict(new { message = "Bu slug zaten kullanılıyor. Farklı bir slug deneyin." });

        var durationMinutes = ComputeDurationMinutes(input);
        var course = new Course
        {
            Slug = slug,
            Category = string.IsNullOrWhiteSpace(input.Category) ? null : input.Category.Trim(),
            Level = string.IsNullOrWhiteSpace(input.Level) ? null : input.Level.Trim(),
            DurationMinutes = durationMinutes,
            InstructorName = null,
            ImageUrl = string.IsNullOrWhiteSpace(input.ImageUrl) ? null : input.ImageUrl.Trim(),
            HasCertificate = input.HasCertificate,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Courses.Add(course);
        await _context.SaveChangesAsync(cancellationToken);

        if (input.Translations != null && input.Translations.Count > 0)
        {
            var firstT = input.Translations[0];
            if (string.IsNullOrWhiteSpace(course.Category)) course.Category = string.IsNullOrWhiteSpace(firstT.Category) ? null : firstT.Category.Trim();
            if (string.IsNullOrWhiteSpace(course.Level)) course.Level = string.IsNullOrWhiteSpace(firstT.Level) ? null : firstT.Level.Trim();
            foreach (var t in input.Translations)
            {
                if (InputSanitizer.ContainsDangerousChars(t.Title) || InputSanitizer.ContainsDangerousChars(t.Summary))
                    return BadRequest(new { message = "Başlık veya özet geçersiz karakter içeriyor." });
                if (InputSanitizer.ContainsDangerousChars(t.Category) || InputSanitizer.ContainsDangerousChars(t.Level))
                    return BadRequest(new { message = "Geçersiz karakter içeriyor." });
                _context.CourseTranslations.Add(new CourseTranslation
                {
                    CourseId = course.Id,
                    LanguageId = t.LanguageId,
                    Title = t.Title,
                    Summary = t.Summary,
                    Category = string.IsNullOrWhiteSpace(t.Category) ? null : t.Category.Trim(),
                    Level = string.IsNullOrWhiteSpace(t.Level) ? null : t.Level.Trim()
                });
            }
        }

        if (input.Modules != null)
        {
            foreach (var modInput in input.Modules.OrderBy(m => m.SortOrder))
            {
                var mod = new CourseModule { CourseId = course.Id, SortOrder = modInput.SortOrder };
                _context.CourseModules.Add(mod);
                await _context.SaveChangesAsync(cancellationToken);
                if (modInput.Translations != null)
                    foreach (var t in modInput.Translations)
                        _context.ModuleTranslations.Add(new ModuleTranslation { ModuleId = mod.Id, LanguageId = t.LanguageId, Title = t.Title, Description = t.Description });
                if (modInput.Items != null)
                {
                    foreach (var itemInput in modInput.Items.OrderBy(i => i.SortOrder))
                    {
                        var item = new ModuleItem
                        {
                            ModuleId = mod.Id,
                            SortOrder = itemInput.SortOrder,
                            Type = Enum.TryParse<ModuleItemType>(itemInput.Type, true, out var typ) ? typ : ModuleItemType.Text,
                            VideoUrl = itemInput.VideoUrl,
                            MustWatch = itemInput.MustWatch,
                            VideoDurationSeconds = itemInput.VideoDurationSeconds,
                            FilePath = itemInput.FilePath,
                            TextContent = itemInput.TextContent,
                            QuizDataJson = itemInput.QuizDataJson,
                            PassScorePercent = itemInput.PassScorePercent
                        };
                        _context.ModuleItems.Add(item);
                        await _context.SaveChangesAsync(cancellationToken);
                        if (itemInput.Translations != null)
                            foreach (var t in itemInput.Translations)
                                _context.ModuleItemTranslations.Add(new ModuleItemTranslation { ModuleItemId = item.Id, LanguageId = t.LanguageId, Title = t.Title });
                    }
                }
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
        await _context.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = course.Id }, new { id = course.Id });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CourseFullInput input, CancellationToken cancellationToken)
    {
        var course = await _context.Courses
            .Include(c => c.Translations)
            .Include(c => c.Modules)
            .ThenInclude(m => m.Translations)
            .Include(c => c.Modules)
            .ThenInclude(m => m.Items)
            .ThenInclude(i => i.Translations)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (course == null) return NotFound();

        var slug = InputSanitizer.SanitizeSlug(input.Slug, 200);
        if (string.IsNullOrEmpty(slug)) return BadRequest(new { message = "Slug is required." });
        if (InputSanitizer.ContainsDangerousChars(input.Category) || InputSanitizer.ContainsDangerousChars(input.Level))
            return BadRequest(new { message = "Geçersiz karakter içeriyor." });
        if (slug != course.Slug && await _context.Courses.AnyAsync(c => c.Slug == slug, cancellationToken))
            return Conflict("Slug already exists.");

        course.Slug = slug;
        course.DurationMinutes = ComputeDurationMinutes(input);
        course.InstructorName = null;
        course.ImageUrl = string.IsNullOrWhiteSpace(input.ImageUrl) ? null : input.ImageUrl.Trim();
        course.HasCertificate = input.HasCertificate;
        course.UpdatedAt = DateTime.UtcNow;

        _context.CourseTranslations.RemoveRange(course.Translations);
        if (input.Translations != null && input.Translations.Count > 0)
        {
            var firstT = input.Translations[0];
            course.Category = string.IsNullOrWhiteSpace(firstT.Category) ? null : firstT.Category.Trim();
            course.Level = string.IsNullOrWhiteSpace(firstT.Level) ? null : firstT.Level.Trim();
            foreach (var t in input.Translations)
            {
                if (InputSanitizer.ContainsDangerousChars(t.Category) || InputSanitizer.ContainsDangerousChars(t.Level))
                    return BadRequest(new { message = "Geçersiz karakter içeriyor." });
                _context.CourseTranslations.Add(new CourseTranslation
                {
                    CourseId = course.Id,
                    LanguageId = t.LanguageId,
                    Title = t.Title,
                    Summary = t.Summary,
                    Category = string.IsNullOrWhiteSpace(t.Category) ? null : t.Category.Trim(),
                    Level = string.IsNullOrWhiteSpace(t.Level) ? null : t.Level.Trim()
                });
            }
        }

        foreach (var mod in course.Modules.ToList())
        {
            _context.ModuleItemTranslations.RemoveRange(mod.Items.SelectMany(i => i.Translations));
            _context.ModuleItems.RemoveRange(mod.Items);
            _context.ModuleTranslations.RemoveRange(mod.Translations);
        }
        _context.CourseModules.RemoveRange(course.Modules);

        if (input.Modules != null)
        {
            foreach (var modInput in input.Modules.OrderBy(m => m.SortOrder))
            {
                var mod = new CourseModule { CourseId = course.Id, SortOrder = modInput.SortOrder };
                _context.CourseModules.Add(mod);
                await _context.SaveChangesAsync(cancellationToken);
                if (modInput.Translations != null)
                    foreach (var t in modInput.Translations)
                        _context.ModuleTranslations.Add(new ModuleTranslation { ModuleId = mod.Id, LanguageId = t.LanguageId, Title = t.Title, Description = t.Description });
                if (modInput.Items != null)
                    foreach (var itemInput in modInput.Items.OrderBy(i => i.SortOrder))
                    {
                        var item = new ModuleItem
                        {
                            ModuleId = mod.Id,
                            SortOrder = itemInput.SortOrder,
                            Type = Enum.TryParse<ModuleItemType>(itemInput.Type, true, out var typ) ? typ : ModuleItemType.Text,
                            VideoUrl = itemInput.VideoUrl,
                            MustWatch = itemInput.MustWatch,
                            VideoDurationSeconds = itemInput.VideoDurationSeconds,
                            FilePath = itemInput.FilePath,
                            TextContent = itemInput.TextContent,
                            QuizDataJson = itemInput.QuizDataJson,
                            PassScorePercent = itemInput.PassScorePercent
                        };
                        _context.ModuleItems.Add(item);
                        await _context.SaveChangesAsync(cancellationToken);
                        if (itemInput.Translations != null)
                            foreach (var t in itemInput.Translations)
                                _context.ModuleItemTranslations.Add(new ModuleItemTranslation { ModuleItemId = item.Id, LanguageId = t.LanguageId, Title = t.Title });
                    }
            }
        }
        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { id = course.Id });
    }

    private static readonly string[] AllowedImageExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
    private static readonly string[] AllowedMaterialExtensions = { ".pdf", ".zip", ".rar", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".jpg", ".jpeg", ".png", ".webp", ".gif" };

    [HttpPost("upload-cover")]
    public async Task<IActionResult> UploadCover(IFormFile? file, CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Dosya seçilmedi." });
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrEmpty(ext) || !AllowedImageExtensions.Contains(ext))
            return BadRequest(new { message = "Sadece resim dosyaları (jpg, png, webp, gif) yüklenebilir." });
        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var uploadDir = Path.Combine(webRoot, "uploads", "courses");
        Directory.CreateDirectory(uploadDir);
        var fileName = $"{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(uploadDir, fileName);
        await using (var stream = new FileStream(fullPath, FileMode.Create))
            await file.CopyToAsync(stream, cancellationToken);
        var url = "/uploads/courses/" + fileName;
        return Ok(new { url });
    }



    [HttpPost("upload-material-v2")]
    public async Task<IActionResult> UploadMaterial(IFormFile? file, CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Dosya seçilmedi." });
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrEmpty(ext) || !AllowedMaterialExtensions.Contains(ext))
            return BadRequest(new { message = "Geçersiz dosya türü. Sadece PDF ve ofis belgeleri yüklenebilir." });
        
        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var uploadDir = Path.Combine(webRoot, "uploads", "materials");
        Directory.CreateDirectory(uploadDir);
        
        var fileName = $"{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(uploadDir, fileName);
        
        await using (var stream = new FileStream(fullPath, FileMode.Create))
            await file.CopyToAsync(stream, cancellationToken);
            
        var url = "/uploads/materials/" + fileName;
        return Ok(new { url });
    }

    [HttpDelete("{id:int}/cover")]
    public async Task<IActionResult> DeleteCover(int id, CancellationToken cancellationToken)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (course == null) return NotFound();
        if (string.IsNullOrEmpty(course.ImageUrl)) return Ok(new { deleted = false });
        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var segment = course.ImageUrl.TrimStart('/');
        var fullPath = Path.Combine(webRoot, segment);
        if (System.IO.File.Exists(fullPath))
        {
            try { System.IO.File.Delete(fullPath); } catch { /* ignore */ }
        }
        course.ImageUrl = null;
        course.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { deleted = true });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        try
        {
            var course = await _context.Courses
                .Include(c => c.Translations)
                .Include(c => c.Modules)
                .ThenInclude(m => m.Translations)
                .Include(c => c.Modules)
                .ThenInclude(m => m.Items)
                .ThenInclude(i => i.Translations)
                .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
            if (course == null) return NotFound();

            // Bağlı tabloları önce sil (FK kısıtı yüzünden Course doğrudan silinemez)
            var moduleItemIds = course.Modules.SelectMany(m => m.Items).Select(i => i.Id).ToList();
            if (moduleItemIds.Count > 0)
            {
                var progressToRemove = await _context.UserModuleItemProgresses
                    .Where(p => moduleItemIds.Contains(p.ModuleItemId))
                    .ToListAsync(cancellationToken);
                _context.UserModuleItemProgresses.RemoveRange(progressToRemove);
            }

            var certs = await _context.Certificates.Where(c => c.CourseId == id).ToListAsync(cancellationToken);
            _context.Certificates.RemoveRange(certs);

            var enrollments = await _context.UserCourseEnrollments.Where(e => e.CourseId == id).ToListAsync(cancellationToken);
            _context.UserCourseEnrollments.RemoveRange(enrollments);

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
        {
            return StatusCode(500, new { message = "Kurs silinirken veritabanı hatası: " + (ex.InnerException?.Message ?? ex.Message) });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Kurs silinemedi: " + ex.Message });
        }
    }

    public class CourseFullInput
    {
        public string Slug { get; set; } = "";
        public string? Category { get; set; }
        public string? Level { get; set; }
        public int DurationMinutes { get; set; }
        public string? InstructorName { get; set; }
        public string? ImageUrl { get; set; }
        public bool HasCertificate { get; set; } = true;
        public List<CourseTranslationInput>? Translations { get; set; }
        public List<ModuleInput>? Modules { get; set; }
    }

    public class CourseTranslationInput
    {
        public int LanguageId { get; set; }
        public string Title { get; set; } = "";
        public string? Summary { get; set; }
        public string? Category { get; set; }
        public string? Level { get; set; }
    }

    public class ModuleInput
    {
        public int SortOrder { get; set; }
        public List<ModuleTranslationInput>? Translations { get; set; }
        public List<ModuleItemInput>? Items { get; set; }
    }

    public class ModuleTranslationInput
    {
        public int LanguageId { get; set; }
        public string Title { get; set; } = "";
        public string? Description { get; set; }
    }

    public class ModuleItemInput
    {
        public int SortOrder { get; set; }
        public string Type { get; set; } = "Text"; // Video, Pdf, Text, Quiz
        public string? VideoUrl { get; set; }
        public bool MustWatch { get; set; }
        public int? VideoDurationSeconds { get; set; }
        public string? FilePath { get; set; }
        public string? TextContent { get; set; }
        public string? QuizDataJson { get; set; }
        public int? PassScorePercent { get; set; }
        public List<ItemTranslationInput>? Translations { get; set; }
    }

    public class ItemTranslationInput
    {
        public int LanguageId { get; set; }
        public string Title { get; set; } = "";
    }
}
