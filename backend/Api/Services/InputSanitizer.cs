using System.Text.RegularExpressions;

namespace backend.Api.Services;

/// <summary>
/// Kullanıcı girdilerini temizler - SQL injection, XSS ve tehlikeli karakterleri engeller.
/// EF Core zaten parametreli sorgu kullandığı için SQL injection riski düşük,
/// ancak ek güvenlik katmanı olarak tehlikeli pattern'leri filtreler.
/// </summary>
public static class InputSanitizer
{
    /// <summary>XSS: sadece script/html için tehlikeli olan &lt; ve &gt;. Noktalı virgül, tire vb. parametreli sorguda güvenli.</summary>
    private static readonly Regex DangerousPattern = new(
        @"<|>",
        RegexOptions.Compiled);

    /// <summary>MaxLength aşıldığında true döner.</summary>
    public static bool ExceedsMaxLength(string? value, int maxLen) =>
        value != null && value.Length > maxLen;

    /// <summary>Boş veya sadece boşluk ise true.</summary>
    public static bool IsEmpty(string? value) =>
        string.IsNullOrWhiteSpace(value);

    /// <summary>Tehlikeli karakterler içeriyorsa true döner.</summary>
    public static bool ContainsDangerousChars(string? value) =>
        !string.IsNullOrEmpty(value) && DangerousPattern.IsMatch(value);

    /// <summary>Girdiyi güvenli hale getirir. Tehlikeli karakterler varsa null döner.</summary>
    public static string? Sanitize(string? value, int maxLength = 1000)
    {
        if (value == null) return null;
        var trimmed = value.Trim();
        if (trimmed.Length == 0) return null;
        if (trimmed.Length > maxLength) return null;
        if (ContainsDangerousChars(trimmed)) return null;
        return trimmed;
    }

    /// <summary>Slug için güvenli karakterler: harf, rakam, tire.</summary>
    public static string? SanitizeSlug(string? value, int maxLength = 200)
    {
        if (value == null) return null;
        var trimmed = value.Trim().ToLowerInvariant();
        if (trimmed.Length == 0) return null;
        if (trimmed.Length > maxLength) return null;
        var safe = Regex.Replace(trimmed, @"[^a-z0-9\-]", "-");
        safe = Regex.Replace(safe, @"-+", "-").Trim('-');
        return string.IsNullOrEmpty(safe) ? null : safe;
    }

    /// <summary>URL için basit doğrulama - http/https ile başlamalı.</summary>
    public static bool IsValidUrl(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return false;
        return value.StartsWith("http://", StringComparison.OrdinalIgnoreCase)
            || value.StartsWith("https://", StringComparison.OrdinalIgnoreCase);
    }
}
