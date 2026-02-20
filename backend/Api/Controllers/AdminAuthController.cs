using backend.Api.Data;
using backend.Api.Entities;
using backend.Api.Models.Admin;
using backend.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace backend.Api.Controllers;

[ApiController]
[Route("api/admin/auth")]
[EnableRateLimiting("auth")]
public sealed class AdminAuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher<Admin> _passwordHasher;
    private readonly TokenService _tokenService;

    public AdminAuthController(
        AppDbContext context,
        IPasswordHasher<Admin> passwordHasher,
        TokenService tokenService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(AdminLoginRequest request)
    {
        var credential = request.UsernameOrEmail.Trim();
        var normalized = credential.ToUpperInvariant();

        var admin = await _context.Admins
            .FirstOrDefaultAsync(a => a.NormalizedUsername == normalized || a.NormalizedEmail == normalized);

        if (admin is null)
        {
            return Unauthorized("Invalid credentials.");
        }

        var result = _passwordHasher.VerifyHashedPassword(admin, admin.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized("Invalid credentials.");
        }

        var response = _tokenService.CreateToken(
            admin.Id.ToString(),
            admin.Email,
            admin.Username,
            RoleNames.Admin,
            admin.Username);

        return Ok(response);
    }
}
