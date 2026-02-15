using backend.Api.Data;
using backend.Api.Entities;
using backend.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Api.Controllers;

[ApiController]
[Route("api/admin/languages")]
[Authorize(Roles = "Admin")]
public sealed class AdminLanguagesController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminLanguagesController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var list = await _context.Languages
            .OrderBy(l => l.SortOrder)
            .Select(l => new { l.Id, l.Code, l.Name, l.SortOrder })
            .ToListAsync(cancellationToken);
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
        var l = await _context.Languages.FindAsync(new object[] { id }, cancellationToken);
        if (l == null) return NotFound();
        return Ok(new { l.Id, l.Code, l.Name, l.SortOrder });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] LanguageInput? input, CancellationToken cancellationToken)
    {
        if (input == null) return BadRequest(new { message = "Geçersiz istek." });
        var code = (input.Code ?? "").Trim().ToLowerInvariant();
        if (string.IsNullOrEmpty(code)) return BadRequest(new { message = "Kod zorunludur." });
        if (InputSanitizer.ContainsDangerousChars(code) || InputSanitizer.ContainsDangerousChars(input.Name))
            return BadRequest(new { message = "Geçersiz karakter içeriyor." });
        if (await _context.Languages.AnyAsync(l => l.Code == code, cancellationToken))
            return Conflict("Language code already exists.");
        var l = new Language
        {
            Code = code,
            Name = input.Name.Trim(),
            SortOrder = input.SortOrder
        };
        _context.Languages.Add(l);
        await _context.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = l.Id }, new { id = l.Id });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] LanguageInput? input, CancellationToken cancellationToken)
    {
        if (input == null) return BadRequest(new { message = "Geçersiz istek." });
        var l = await _context.Languages.FindAsync(new object[] { id }, cancellationToken);
        if (l == null) return NotFound();
        var code = (input.Code ?? "").Trim().ToLowerInvariant();
        if (InputSanitizer.ContainsDangerousChars(code) || InputSanitizer.ContainsDangerousChars(input.Name))
            return BadRequest(new { message = "Geçersiz karakter içeriyor." });
        if (code != l.Code && await _context.Languages.AnyAsync(x => x.Code == code, cancellationToken))
            return Conflict("Language code already exists.");
        l.Code = code;
        l.Name = input.Name.Trim();
        l.SortOrder = input.SortOrder;
        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { id = l.Id });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var l = await _context.Languages.FindAsync(new object[] { id }, cancellationToken);
        if (l == null) return NotFound();
        _context.Languages.Remove(l);
        await _context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    public class LanguageInput
    {
        public string Code { get; set; } = "";
        public string Name { get; set; } = "";
        public int SortOrder { get; set; }
    }
}
