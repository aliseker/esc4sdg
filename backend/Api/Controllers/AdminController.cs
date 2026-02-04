using System.Security.Claims;
using backend.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public sealed class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("me")]
    public IActionResult Me()
    {
        var email = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue(System.Security.Claims.ClaimTypes.Email);
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "Admin";
        return Ok(new { email, role });
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard(CancellationToken cancellationToken)
    {
        var coursesCount = await _context.Courses.CountAsync(cancellationToken);
        var usersCount = await _context.Users.CountAsync(cancellationToken);
        return Ok(new
        {
            message = "OK",
            courses = coursesCount,
            users = usersCount,
            timestamp = DateTime.UtcNow.ToString("O")
        });
    }
}
