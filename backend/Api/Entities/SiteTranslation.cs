using System.ComponentModel.DataAnnotations;

namespace backend.Api.Entities;

/// <summary>
/// Site genelindeki çeviri metinleri (hero, footer, nav vb.).
/// Key: "home.title1", "home.subtitle", "about.objectives" (dizi değerler JSON string).
/// </summary>
public class SiteTranslation
{
    public int LanguageId { get; set; }
    public Language Language { get; set; } = null!;

    [Required]
    [MaxLength(120)]
    public string Key { get; set; } = null!;

    [Required]
    public string Value { get; set; } = null!;
}
