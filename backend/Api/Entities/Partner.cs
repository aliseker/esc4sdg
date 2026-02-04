using System.ComponentModel.DataAnnotations;

namespace backend.Api.Entities;

public class Partner
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    public string Country { get; set; } = default!;

    [MaxLength(10)]
    public string? CountryCode { get; set; }

    [MaxLength(80)]
    public string? Type { get; set; }

    [MaxLength(500)]
    public string? Website { get; set; }

    /// <summary>Logo image URL or path (e.g. /uploads/partners/logo.png).</summary>
    [MaxLength(500)]
    public string? LogoUrl { get; set; }

    [MaxLength(80)]
    public string? Role { get; set; }

    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PartnerTranslation> Translations { get; set; } = new List<PartnerTranslation>();
}

public class PartnerTranslation
{
    public int PartnerId { get; set; }
    public Partner? Partner { get; set; }

    public int LanguageId { get; set; }
    public Language? Language { get; set; }

    public string? Description { get; set; }
}
