using System.ComponentModel.DataAnnotations;

namespace backend.Api.Entities;

public class CourseModule
{
    public int Id { get; set; }

    public int CourseId { get; set; }
    public Course? Course { get; set; }

    public int SortOrder { get; set; }

    public ICollection<ModuleTranslation> Translations { get; set; } = new List<ModuleTranslation>();
    public ICollection<ModuleItem> Items { get; set; } = new List<ModuleItem>();
}

public class ModuleTranslation
{
    public int ModuleId { get; set; }
    public CourseModule? Module { get; set; }

    public int LanguageId { get; set; }
    public Language? Language { get; set; }

    [Required]
    [MaxLength(300)]
    public string Title { get; set; } = default!;

    public string? Description { get; set; }
}
