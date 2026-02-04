using System.ComponentModel.DataAnnotations;

namespace backend.Api.Entities;

public class ModuleItem
{
    public int Id { get; set; }

    public int ModuleId { get; set; }
    public CourseModule? Module { get; set; }

    public int SortOrder { get; set; }

    public ModuleItemType Type { get; set; }

    [MaxLength(1000)]
    public string? VideoUrl { get; set; }

    /// <summary>If true, user must watch video to completion (no skipping ahead).</summary>
    public bool MustWatch { get; set; }

    /// <summary>Video duration in seconds; used with MustWatch to enforce completion.</summary>
    public int? VideoDurationSeconds { get; set; }

    [MaxLength(500)]
    public string? FilePath { get; set; }

    public string? TextContent { get; set; }

    /// <summary>JSON for quiz: questions with prompt/options per language and correctOptionId.</summary>
    public string? QuizDataJson { get; set; }

    public int? PassScorePercent { get; set; }

    public ICollection<ModuleItemTranslation> Translations { get; set; } = new List<ModuleItemTranslation>();
}

public class ModuleItemTranslation
{
    public int ModuleItemId { get; set; }
    public ModuleItem? ModuleItem { get; set; }

    public int LanguageId { get; set; }
    public Language? Language { get; set; }

    [Required]
    [MaxLength(300)]
    public string Title { get; set; } = default!;
}
