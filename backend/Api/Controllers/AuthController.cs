using backend.Api.Data;
using backend.Api.Entities;
using backend.Api.Models.Auth;
using backend.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly TokenService _tokenService;

    public AuthController(
        AppDbContext context,
        IPasswordHasher<User> passwordHasher,
        TokenService tokenService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        try
        {
            var normalizedEmail = request.Email?.Trim().ToUpperInvariant() ?? string.Empty;
            var username = string.IsNullOrWhiteSpace(request.Username)
                ? request.Email.Split('@')[0].Trim()
                : request.Username.Trim();
            var normalizedUsername = username.ToUpperInvariant();

            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Email and password are required.");
            }

            if (await _context.Users.AnyAsync(u => u.NormalizedEmail == normalizedEmail || u.NormalizedUsername == normalizedUsername))
            {
                return Conflict("Email or username already in use.");
            }

            var userRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == RoleNames.User);
            if (userRole is null)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "User role is not configured. Restart the API to seed roles." });
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email.Trim(),
                NormalizedEmail = normalizedEmail,
                Username = username,
                NormalizedUsername = normalizedUsername,
                DisplayName = string.IsNullOrWhiteSpace(request.DisplayName) ? null : request.DisplayName.Trim(),
                Gender = string.IsNullOrWhiteSpace(request.Gender) ? null : request.Gender.Trim(),
                Age = request.Age,
                School = string.IsNullOrWhiteSpace(request.School) ? null : request.School.Trim(),
                RoleId = userRole.Id,
                CreatedAt = DateTime.UtcNow
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var response = _tokenService.CreateToken(
                user.Id.ToString(),
                user.Email,
                user.Username,
                RoleNames.User);

            return Created(string.Empty, response);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Registration failed.", detail = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var credential = request.EmailOrUsername.Trim();
        var normalized = credential.ToUpperInvariant();

        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.NormalizedEmail == normalized || u.NormalizedUsername == normalized);

        if (user is null)
        {
            return Unauthorized("Invalid credentials.");
        }

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized("Invalid credentials.");
        }

        var response = _tokenService.CreateToken(
            user.Id.ToString(),
            user.Email,
            user.Username,
            user.Role?.Name ?? RoleNames.User);

        return Ok(response);
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
            return Unauthorized();

        var user = await _context.Users.FindAsync(userGuid);
        if (user is null) return NotFound();

        if (!string.IsNullOrWhiteSpace(request.DisplayName))
            user.DisplayName = request.DisplayName.Trim();

        await _context.SaveChangesAsync();
        return Ok(new { user.DisplayName });
    }
}
