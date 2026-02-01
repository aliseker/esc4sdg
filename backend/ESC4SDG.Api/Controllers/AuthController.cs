using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ESC4SDG.Api.Models.Auth;
using ESC4SDG.Api.Services;

namespace ESC4SDG.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(JwtService jwtService, IConfiguration configuration) : ControllerBase
{
    /// <summary>
    /// Admin girişi. Email ve şifre ile JWT token döner.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public ActionResult<LoginResponse> Login([FromBody] LoginRequest request)
    {
        var adminEmail = configuration["Admin:Email"] ?? "admin@esc4sdg.local";
        var adminPassword = configuration["Admin:Password"] ?? "Admin123!";

        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Email and password are required." });

        if (!string.Equals(request.Email.Trim(), adminEmail, StringComparison.OrdinalIgnoreCase) ||
            request.Password != adminPassword)
            return Unauthorized(new { message = "Invalid email or password." });

        var token = jwtService.GenerateToken(request.Email.Trim(), "Admin");
        var expiresMinutes = int.TryParse(configuration["Jwt:ExpirationMinutes"], out var m) ? m : 60;

        return Ok(new LoginResponse(
            Token: token,
            Email: request.Email.Trim(),
            Role: "Admin",
            ExpiresAt: DateTime.UtcNow.AddMinutes(expiresMinutes)
        ));
    }

    /// <summary>
    /// Mevcut kullanıcı bilgisi (token geçerliyse). Admin paneli için.
    /// </summary>
    [HttpGet("me")]
    [Authorize(Roles = "Admin")]
    public IActionResult Me()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        var role = User.FindFirstValue(ClaimTypes.Role);
        return Ok(new { email, role });
    }
}
