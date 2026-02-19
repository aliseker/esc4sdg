using backend.Api.Data;
using backend.Api.Entities;
using backend.Api.Models.Auth;
using backend.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("auth")]
public sealed class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly TokenService _tokenService;
    private readonly EmailService _emailService;

    private readonly IConfiguration _configuration;

    public AuthController(
        AppDbContext context,
        IPasswordHasher<User> passwordHasher,
        TokenService tokenService,
        EmailService emailService,
        IConfiguration configuration)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _emailService = emailService;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        try
        {
            var normalizedEmail = request.Email?.Trim().ToUpperInvariant() ?? string.Empty;
            var username = string.IsNullOrWhiteSpace(request.Username)
                ? request.Email.Trim()
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
                RoleNames.User,
                user.DisplayName);

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
            user.Role?.Name ?? RoleNames.User,
            user.DisplayName);

        return Ok(response);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToUpperInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);

        if (user == null)
        {
            // Don't reveal that user doesn't exist
            return Ok(new { message = "If the email exists, a reset link has been sent." });
        }

        var token = Guid.NewGuid().ToString("N");
        user.PasswordResetToken = token;
        user.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddHours(24);
        await _context.SaveChangesAsync();

        var frontendUrl = _configuration["FrontendUrl"] ?? "https://esc4sdg.com";
        var resetLink = $"{frontendUrl}/reset-password?token={token}&email={Uri.EscapeDataString(user.Email)}";
        
        var body = $@"
<div style=""font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #f3f4f6;"">
    <div style=""background-color: #0f766e; padding: 24px; text-align: center;"">
        <h1 style=""color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;"">Escape4SDG</h1>
    </div>
    <div style=""padding: 32px;"">
        <h2 style=""color: #111827; margin-top: 0; font-size: 20px;"">Reset Your Password</h2>
        <p style=""color: #4b5563; line-height: 1.6; margin-bottom: 24px;"">
            We received a request to reset the password for your account. If you made this request, click the button below to choose a new password:
        </p>
        <div style=""text-align: center; margin: 32px 0;"">
            <a href=""{resetLink}"" style=""background-color: #0f766e; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; box-shadow: 0 2px 4px rgba(15, 118, 110, 0.2);"">
                Reset Password
            </a>
        </div>
        <p style=""color: #6b7280; font-size: 14px; line-height: 1.6;"">
            If you didn't request this, you can safely ignore this email.
        </p>
        <hr style=""border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;"">
        <p style=""color: #9ca3af; font-size: 12px; text-align: center; margin: 0;"">
            © {DateTime.UtcNow.Year} Escape4SDG. All rights reserved.
        </p>
    </div>
</div>";
        
        // Fire and forget email or background job in prod. For now await.
        try
        {
            await _emailService.SendEmailAsync(user.Email, "Reset Password", body);
        }
        catch (Exception ex)
        {
            // Log error but generally return success to user
            Console.WriteLine($"Email sending failed: {ex.Message}");
        }

        return Ok(new { message = "If the email exists, a reset link has been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToUpperInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);

        if (user == null || user.PasswordResetToken != request.Token || user.PasswordResetTokenExpiresAt < DateTime.UtcNow)
        {
            return BadRequest("Invalid token or email.");
        }

        user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiresAt = null;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password reset successful." });
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
