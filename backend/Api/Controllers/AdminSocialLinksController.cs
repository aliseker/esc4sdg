using backend.Api.Data;
using backend.Api.Entities;
using backend.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Api.Controllers;

[ApiController]
[Route("api/admin/social-links")]
[Authorize(Roles = "Admin")]
public sealed class AdminSocialLinksController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminSocialLinksController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var list = await _context.SocialLinks
            .OrderBy(s => s.SortOrder)
            .Select(s => new { s.Id, s.Platform, s.Label, s.Url, s.SortOrder })
            .ToListAsync(cancellationToken);
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
        var s = await _context.SocialLinks.FindAsync(new object[] { id }, cancellationToken);
        if (s == null) return NotFound();
        return Ok(new { s.Id, s.Platform, s.Label, s.Url, s.SortOrder });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SocialLinkInput? input, CancellationToken cancellationToken)
    {
        if (input == null)
            return BadRequest(new { message = "Platform ve URL zorunludur." });
        var platform = (input.Platform ?? "").Trim();
        var url = (input.Url ?? "").Trim();
        if (string.IsNullOrEmpty(platform))
            return BadRequest(new { message = "Platform seçin." });
        if (string.IsNullOrEmpty(url))
            return BadRequest(new { message = "URL girin." });
        if (platform.Length > 50)
            return BadRequest(new { message = "Platform adı çok uzun." });
        if (url.Length > 500)
            return BadRequest(new { message = "URL çok uzun." });
        if (InputSanitizer.ContainsDangerousChars(platform) || InputSanitizer.ContainsDangerousChars(input.Label))
            return BadRequest(new { message = "Geçersiz karakter içeriyor." });
        if (!InputSanitizer.IsValidUrl(url))
            return BadRequest(new { message = "URL http veya https ile başlamalı." });
        try
        {
            var maxOrder = await _context.SocialLinks.MaxAsync(x => (int?)x.SortOrder, cancellationToken) ?? -1;
            var s = new SocialLink
            {
                Platform = platform,
                Label = string.IsNullOrWhiteSpace(input.Label) ? null : input.Label.Trim(),
                Url = url,
                SortOrder = maxOrder + 1
            };
            _context.SocialLinks.Add(s);
            await _context.SaveChangesAsync(cancellationToken);
            return CreatedAtAction(nameof(Get), new { id = s.Id }, new { id = s.Id });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Veritabanı hatası: " + (ex.InnerException?.Message ?? ex.Message) });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] SocialLinkInput? input, CancellationToken cancellationToken)
    {
        if (input == null) return BadRequest(new { message = "Geçersiz istek." });
        var platform = (input.Platform ?? "").Trim();
        var url = (input.Url ?? "").Trim();
        if (string.IsNullOrEmpty(platform) || string.IsNullOrEmpty(url))
            return BadRequest(new { message = "Platform ve URL zorunludur." });
        if (InputSanitizer.ContainsDangerousChars(platform) || InputSanitizer.ContainsDangerousChars(input.Label))
            return BadRequest(new { message = "Geçersiz karakter içeriyor." });
        if (!InputSanitizer.IsValidUrl(url))
            return BadRequest(new { message = "URL http veya https ile başlamalı." });
        var s = await _context.SocialLinks.FindAsync(new object[] { id }, cancellationToken);
        if (s == null) return NotFound();
        s.Platform = platform;
        s.Label = string.IsNullOrWhiteSpace(input.Label) ? null : input.Label.Trim();
        s.Url = url;
        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { id = s.Id });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var s = await _context.SocialLinks.FindAsync(new object[] { id }, cancellationToken);
        if (s == null) return NotFound();
        _context.SocialLinks.Remove(s);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    public class SocialLinkInput
    {
        public string Platform { get; set; } = "";
        public string? Label { get; set; }
        public string Url { get; set; } = "";
        public int SortOrder { get; set; }
    }
}
