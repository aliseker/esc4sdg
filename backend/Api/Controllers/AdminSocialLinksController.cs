using backend.Api.Data;
using backend.Api.Entities;
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
    public async Task<IActionResult> Create([FromBody] SocialLinkInput input, CancellationToken cancellationToken)
    {
        var maxOrder = await _context.SocialLinks.Select(x => x.SortOrder).DefaultIfEmpty(-1).MaxAsync(cancellationToken);
        var s = new SocialLink
        {
            Platform = input.Platform.Trim(),
            Label = string.IsNullOrWhiteSpace(input.Label) ? null : input.Label.Trim(),
            Url = input.Url.Trim(),
            SortOrder = maxOrder + 1
        };
        _context.SocialLinks.Add(s);
        await _context.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = s.Id }, new { id = s.Id });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] SocialLinkInput input, CancellationToken cancellationToken)
    {
        var s = await _context.SocialLinks.FindAsync(new object[] { id }, cancellationToken);
        if (s == null) return NotFound();
        s.Platform = input.Platform.Trim();
        s.Label = string.IsNullOrWhiteSpace(input.Label) ? null : input.Label.Trim();
        s.Url = input.Url.Trim();
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
