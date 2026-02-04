using backend.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class LanguagesController : ControllerBase
{
    private readonly AppDbContext _context;

    public LanguagesController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var list = await _context.Languages
            .OrderBy(l => l.SortOrder)
            .Select(l => new { l.Id, l.Code, l.Name, l.SortOrder })
            .ToListAsync(cancellationToken);
        return Ok(list);
    }
}
