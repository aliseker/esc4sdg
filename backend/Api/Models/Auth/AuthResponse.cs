namespace backend.Api.Models.Auth;

public sealed class AuthResponse
{
    public string Token { get; set; } = default!;
    public DateTime ExpiresAt { get; set; }
    public string Role { get; set; } = default!;
    public string? Email { get; set; }
    public string? Username { get; set; }
}
