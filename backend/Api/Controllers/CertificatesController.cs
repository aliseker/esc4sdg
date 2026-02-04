using System.Security.Claims;
using backend.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class CertificatesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CertificatesController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetMyCertificates([FromQuery] string? lang, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            return Unauthorized();

        var languageId = await ResolveLanguageIdAsync(lang ?? "tr", cancellationToken);

        var list = await _context.Certificates
            .Where(c => c.UserId == userGuid)
            .Include(c => c.Course!)
            .ThenInclude(c => c!.Translations)
            .Select(c => new
            {
                c.Id,
                c.CourseId,
                CourseSlug = c.Course!.Slug,
                CourseTitle = c.Course.Translations.Where(t => t.LanguageId == languageId).Select(t => t.Title).FirstOrDefault(),
                c.IssuedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetCertificate(int id, [FromQuery] string? lang, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            return Unauthorized();

        var cert = await _context.Certificates
            .Include(c => c.Course!)
            .ThenInclude(c => c!.Translations)
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userGuid, cancellationToken);
        if (cert == null) return NotFound();

        var languageId = await ResolveLanguageIdAsync(lang ?? "tr", cancellationToken);
        var courseTitle = cert.Course!.Translations.FirstOrDefault(t => t.LanguageId == languageId)?.Title ?? cert.Course.Slug;

        return Ok(new
        {
            cert.Id,
            cert.CourseId,
            CourseSlug = cert.Course.Slug,
            CourseTitle = courseTitle,
            UserName = cert.User!.DisplayName ?? cert.User.Username,
            cert.IssuedAt
        });
    }

    private async Task<int> ResolveLanguageIdAsync(string code, CancellationToken ct)
    {
        var lang = await _context.Languages.FirstOrDefaultAsync(l => l.Code == code, ct);
        return lang?.Id ?? await _context.Languages.OrderBy(l => l.SortOrder).Select(l => l.Id).FirstAsync(ct);
    }
}
