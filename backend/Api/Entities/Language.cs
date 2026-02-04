using System.ComponentModel.DataAnnotations;

namespace backend.Api.Entities;

public class Language
{
    public int Id { get; set; }

    [Required]
    [MaxLength(10)]
    public string Code { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = default!;

    public int SortOrder { get; set; }
}
