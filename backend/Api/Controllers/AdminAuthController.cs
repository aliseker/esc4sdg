using backend.Api.Data;
using backend.Api.Entities;
using backend.Api.Models.Admin;
using backend.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Api.Controllers;

[ApiController]
[Route("api/admin/auth")]
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

    [HttpPost("register")]
    public async Task<IActionResult> Register(AdminCreateRequest request)
    {
        var normalizedUsername = request.Username.Trim().ToUpperInvariant();
        var normalizedEmail = request.Email.Trim().ToUpperInvariant();

        if (await _context.Admins.AnyAsync(a =>
            a.NormalizedUsername == normalizedUsername || a.NormalizedEmail == normalizedEmail))
        {
            return Conflict("Username or email already in use.");
        }

        var admin = new Admin
        {
            Username = request.Username.Trim(),
            NormalizedUsername = normalizedUsername,
            Email = request.Email.Trim(),
            NormalizedEmail = normalizedEmail,
            CreatedAt = DateTime.UtcNow
        };

        admin.PasswordHash = _passwordHasher.HashPassword(admin, request.Password);

        _context.Admins.Add(admin);
        await _context.SaveChangesAsync();

        return Created(string.Empty, new
        {
            admin.Id,
            admin.Username,
            admin.Email
        });
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
            RoleNames.Admin);

        return Ok(response);
    }
}
