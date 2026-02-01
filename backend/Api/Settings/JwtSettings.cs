namespace backend.Api.Settings;

public sealed class JwtSettings
{
    public const string SectionName = "JwtSettings";
    public const string DefaultSecret = "Escape4SDG-JwtSecretKey-AtLeast32Chars!";

    public string Issuer { get; set; } = "esc4sdg";
    public string Audience { get; set; } = "esc4sdg";
    public string Secret { get; set; } = DefaultSecret;
    public int ExpiryMinutes { get; set; } = 60;
}
