using backend.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Api.Controllers;

[ApiController]
[Route("api/social-links")]
[AllowAnonymous]
public sealed class SocialLinksController : ControllerBase
{
    private readonly AppDbContext _context;

    public SocialLinksController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var list = await _context.SocialLinks
            .OrderBy(s => s.SortOrder)
            .Select(s => new { s.Id, s.Platform, s.Label, s.Url, s.SortOrder })
            .ToListAsync(cancellationToken);
        return Ok(list);
    }
}
