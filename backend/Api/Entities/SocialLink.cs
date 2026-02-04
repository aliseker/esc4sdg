using System.ComponentModel.DataAnnotations;

namespace backend.Api.Entities;

public class SocialLink
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Platform { get; set; } = default!;

    [MaxLength(100)]
    public string? Label { get; set; }

    [Required]
    [MaxLength(500)]
    public string Url { get; set; } = default!;

    public int SortOrder { get; set; }
}
