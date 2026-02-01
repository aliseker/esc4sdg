namespace ESC4SDG.Api.Models.Auth;

public record LoginResponse(string Token, string Email, string Role, DateTime ExpiresAt);
