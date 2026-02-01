using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Api.Models.Auth;
using backend.Api.Settings;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace backend.Api.Services;

public sealed class TokenService
{
    private readonly JwtSettings _settings;

    public TokenService(IOptions<JwtSettings> jwtOptions)
    {
        _settings = jwtOptions?.Value ?? new JwtSettings();
    }

    public AuthResponse CreateToken(string subject, string email, string username, string role)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, subject),
            new(JwtRegisteredClaimNames.Email, email),
            new(ClaimTypes.Name, username),
            new(ClaimTypes.Role, role)
        };

        var secret = _settings.Secret ?? JwtSettings.DefaultSecret;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(_settings.ExpiryMinutes);

        var jwt = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            expires: expires,
            signingCredentials: credentials);

        return new AuthResponse
        {
            Token = new JwtSecurityTokenHandler().WriteToken(jwt),
            ExpiresAt = expires,
            Role = role,
            Email = email,
            Username = username
        };
    }
}
