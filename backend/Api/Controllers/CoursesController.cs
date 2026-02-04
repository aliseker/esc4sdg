using System.Security.Claims;
using backend.Api.Data;
using backend.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class CoursesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CoursesController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] string? lang, CancellationToken cancellationToken)
    {
        var languageId = await ResolveLanguageIdAsync(lang ?? "tr", cancellationToken);
        var courses = await _context.Courses
            .Include(c => c.Translations.Where(t => t.LanguageId == languageId))
            .OrderBy(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.Slug,
                Title = c.Translations.Where(t => t.LanguageId == languageId).Select(t => t.Title).FirstOrDefault(),
                Summary = c.Translations.Where(t => t.LanguageId == languageId).Select(t => t.Summary).FirstOrDefault(),
                c.Category,
                c.Level,
                c.DurationMinutes,
                c.InstructorName,
                c.ImageUrl,
                c.HasCertificate,
                LessonCount = c.Modules.SelectMany(m => m.Items).Count()
            })
            .ToListAsync(cancellationToken);
        return Ok(courses);
    }

    [HttpGet("by-slug/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, [FromQuery] string? lang, CancellationToken cancellationToken)
    {
        var languageId = await ResolveLanguageIdAsync(lang ?? "tr", cancellationToken);
        var course = await _context.Courses
            .Include(c => c.Translations)
            .Include(c => c.Modules.OrderBy(m => m.SortOrder))
            .ThenInclude(m => m.Translations)
            .Include(c => c.Modules)
            .ThenInclude(m => m.Items.OrderBy(i => i.SortOrder))
            .ThenInclude(i => i.Translations)
            .AsSplitQuery()
            .FirstOrDefaultAsync(c => c.Slug == slug, cancellationToken);

        if (course == null) return NotFound();

        var courseTitle = course.Translations.FirstOrDefault(t => t.LanguageId == languageId)?.Title ?? "";
        var courseSummary = course.Translations.FirstOrDefault(t => t.LanguageId == languageId)?.Summary;

        int? GetQuizQuestionCount(string? json)
        {
            if (string.IsNullOrEmpty(json)) return null;
            try
            {
                var doc = System.Text.Json.JsonDocument.Parse(json);
                if (doc.RootElement.TryGetProperty("questions", out var q)) return q.GetArrayLength();
            }
            catch { }
            return null;
        }

        var modules = course.Modules.Select(m => new
        {
            m.Id,
            Title = m.Translations.FirstOrDefault(t => t.LanguageId == languageId)?.Title ?? "",
            Description = m.Translations.FirstOrDefault(t => t.LanguageId == languageId)?.Description,
            ItemCount = m.Items.Count,
            Items = m.Items.Select(i => new
            {
                i.Id,
                Title = i.Translations.FirstOrDefault(t => t.LanguageId == languageId)?.Title ?? "",
                Type = i.Type.ToString(),
                QuestionCount = i.Type == ModuleItemType.Quiz ? GetQuizQuestionCount(i.QuizDataJson) : (int?)null
            })
        });

        return Ok(new
        {
            course.Id,
            course.Slug,
            Title = courseTitle,
            Summary = courseSummary,
            course.Category,
            course.Level,
            course.DurationMinutes,
            course.InstructorName,
            course.ImageUrl,
            course.HasCertificate,
            SectionCount = course.Modules.Count,
            LessonCount = course.Modules.SelectMany(m => m.Items).Count(),
            Modules = modules
        });
    }

    [HttpPost("{courseId:int}/enroll")]
    [Authorize]
    public async Task<IActionResult> Enroll(int courseId, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            return Unauthorized();

        var exists = await _context.UserCourseEnrollments
            .AnyAsync(e => e.UserId == userGuid && e.CourseId == courseId, cancellationToken);
        if (exists) return Ok(new { enrolled = true });

        var courseExists = await _context.Courses.AnyAsync(c => c.Id == courseId, cancellationToken);
        if (!courseExists) return NotFound("Course not found.");

        _context.UserCourseEnrollments.Add(new UserCourseEnrollment
        {
            UserId = userGuid,
            CourseId = courseId,
            EnrolledAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { enrolled = true });
    }

    [HttpGet("{courseId:int}/progress")]
    [Authorize]
    public async Task<IActionResult> GetProgress(int courseId, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            return Unauthorized();

        var enrollment = await _context.UserCourseEnrollments
            .FirstOrDefaultAsync(e => e.UserId == userGuid && e.CourseId == courseId, cancellationToken);
        if (enrollment == null) return NotFound("Not enrolled.");

        var completedItemIds = await _context.UserModuleItemProgresses
            .Where(p => p.UserId == userGuid && p.ModuleItem!.Module!.CourseId == courseId && p.CompletedAt != null)
            .Select(p => p.ModuleItemId)
            .ToListAsync(cancellationToken);

        var totalItems = await _context.CourseModules
            .Where(m => m.CourseId == courseId)
            .SelectMany(m => m.Items)
            .CountAsync(cancellationToken);

        var hasCertificate = await _context.Certificates
            .AnyAsync(c => c.UserId == userGuid && c.CourseId == courseId, cancellationToken);

        return Ok(new
        {
            enrolled = true,
            completedAt = enrollment.CompletedAt,
            completedItemIds,
            completedCount = completedItemIds.Count,
            totalItems,
            hasCertificate,
            completed = totalItems > 0 && completedItemIds.Count >= totalItems
        });
    }

    [HttpPost("items/{itemId:int}/complete")]
    [Authorize]
    public async Task<IActionResult> CompleteItem(int itemId, [FromBody] CompleteItemRequest? body, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            return Unauthorized();

        var item = await _context.ModuleItems
            .Include(i => i.Module)
            .FirstOrDefaultAsync(i => i.Id == itemId, cancellationToken);
        if (item == null) return NotFound();

        var courseId = item.Module!.CourseId;
        var enrolled = await _context.UserCourseEnrollments
            .AnyAsync(e => e.UserId == userGuid && e.CourseId == courseId, cancellationToken);
        if (!enrolled) return BadRequest("Not enrolled in this course.");

        var progress = await _context.UserModuleItemProgresses
            .FirstOrDefaultAsync(p => p.UserId == userGuid && p.ModuleItemId == itemId, cancellationToken);

        if (progress == null)
        {
            progress = new UserModuleItemProgress
            {
                UserId = userGuid,
                ModuleItemId = itemId,
                CompletedAt = DateTime.UtcNow,
                ScorePercent = body?.ScorePercent
            };
            _context.UserModuleItemProgresses.Add(progress);
        }
        else
        {
            progress.CompletedAt = DateTime.UtcNow;
            if (body?.ScorePercent != null) progress.ScorePercent = body.ScorePercent;
        }

        await _context.SaveChangesAsync(cancellationToken);

        var totalItems = await _context.CourseModules
            .Where(m => m.CourseId == courseId)
            .SelectMany(m => m.Items)
            .CountAsync(cancellationToken);
        var completedCount = await _context.UserModuleItemProgresses
            .CountAsync(p => p.UserId == userGuid && p.ModuleItem!.Module!.CourseId == courseId && p.CompletedAt != null, cancellationToken);

        if (totalItems > 0 && completedCount >= totalItems)
        {
            var course = await _context.Courses.FindAsync(new object[] { courseId }, cancellationToken);
            if (course?.HasCertificate == true)
            {
                var alreadyHas = await _context.Certificates
                    .AnyAsync(c => c.UserId == userGuid && c.CourseId == courseId, cancellationToken);
                if (!alreadyHas)
                {
                    _context.Certificates.Add(new Certificate
                    {
                        UserId = userGuid,
                        CourseId = courseId,
                        IssuedAt = DateTime.UtcNow
                    });
                    await _context.SaveChangesAsync(cancellationToken);
                }
            }

            var enrollment = await _context.UserCourseEnrollments
                .FirstAsync(e => e.UserId == userGuid && e.CourseId == courseId, cancellationToken);
            if (enrollment.CompletedAt == null)
            {
                enrollment.CompletedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        return Ok(new { completed = true, completedCount, totalItems });
    }

    [HttpGet("{courseId:int}/items/{itemId:int}")]
    [Authorize]
    public async Task<IActionResult> GetItemContent(int courseId, int itemId, [FromQuery] string? lang, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            return Unauthorized();

        var enrolled = await _context.UserCourseEnrollments
            .AnyAsync(e => e.UserId == userGuid && e.CourseId == courseId, cancellationToken);
        if (!enrolled) return Forbid();

        var item = await _context.ModuleItems
            .Include(i => i.Module)
            .Include(i => i.Translations)
            .ThenInclude(t => t.Language)
            .FirstOrDefaultAsync(i => i.Id == itemId && i.Module!.CourseId == courseId, cancellationToken);
        if (item == null) return NotFound();

        var languageId = await ResolveLanguageIdAsync(lang ?? "tr", cancellationToken);
        var title = item.Translations.FirstOrDefault(t => t.LanguageId == languageId)?.Title ?? "";

        return Ok(new
        {
            item.Id,
            Title = title,
            Type = item.Type.ToString(),
            item.VideoUrl,
            item.MustWatch,
            item.VideoDurationSeconds,
            item.FilePath,
            item.TextContent,
            item.QuizDataJson,
            item.PassScorePercent
        });
    }

    [HttpGet("my-courses")]
    [Authorize]
    public async Task<IActionResult> GetMyCourses([FromQuery] string? lang, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            return Unauthorized();

        var languageId = await ResolveLanguageIdAsync(lang ?? "tr", cancellationToken);

        var enrollments = await _context.UserCourseEnrollments
            .Where(e => e.UserId == userGuid)
            .Include(e => e.Course)
            .ThenInclude(c => c!.Translations)
            .Include(e => e.Course)
            .ThenInclude(c => c!.Modules)
            .ThenInclude(m => m.Items)
            .OrderByDescending(e => e.EnrolledAt)
            .ToListAsync(cancellationToken);

        var result = new List<object>();
        foreach (var e in enrollments)
        {
            if (e.Course == null) continue;
            var course = e.Course;
            var courseTitle = course.Translations?.FirstOrDefault(t => t.LanguageId == languageId)?.Title ?? "";
            var totalItems = course.Modules?.SelectMany(m => m.Items).Count() ?? 0;
            var completedItemIds = await _context.UserModuleItemProgresses
                .Where(p => p.UserId == userGuid && p.ModuleItem!.Module!.CourseId == course.Id && p.CompletedAt != null)
                .Select(p => new { p.ModuleItemId, p.ScorePercent })
                .ToListAsync(cancellationToken);
            var completedCount = completedItemIds.Count;
            var quizScores = await _context.UserModuleItemProgresses
                .Where(p => p.UserId == userGuid && p.ModuleItem!.Module!.CourseId == course.Id && p.ScorePercent != null)
                .Include(p => p.ModuleItem)
                .Select(p => new { p.ModuleItem!.Id, p.ModuleItemId, p.ScorePercent })
                .ToListAsync(cancellationToken);
            var hasCertificate = await _context.Certificates
                .AnyAsync(c => c.UserId == userGuid && c.CourseId == course.Id, cancellationToken);

            result.Add(new
            {
                courseId = course.Id,
                courseSlug = course.Slug,
                courseTitle,
                enrolledAt = e.EnrolledAt,
                completedAt = e.CompletedAt,
                completedCount,
                totalItems,
                completed = totalItems > 0 && completedCount >= totalItems,
                hasCertificate,
                quizScores = quizScores.Select(s => new { itemId = s.Id, scorePercent = s.ScorePercent }).ToList()
            });
        }
        return Ok(result);
    }

    private async Task<int> ResolveLanguageIdAsync(string code, CancellationToken ct)
    {
        var lang = await _context.Languages.FirstOrDefaultAsync(l => l.Code == code, ct);
        return lang?.Id ?? await _context.Languages.OrderBy(l => l.SortOrder).Select(l => l.Id).FirstAsync(ct);
    }

    public class CompleteItemRequest
    {
        public int? ScorePercent { get; set; }
    }
}
