using System.ComponentModel.DataAnnotations;

namespace backend.Api.Entities;

public class Project
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Slug { get; set; } = default!;

    /// <summary>Cover image URL (e.g. /uploads/projects/cover-xxx.jpg).</summary>
    [MaxLength(500)]
    public string? CoverImageUrl { get; set; }

    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ProjectTranslation> Translations { get; set; } = new List<ProjectTranslation>();
    public ICollection<ProjectGalleryImage> GalleryImages { get; set; } = new List<ProjectGalleryImage>();
}

public class ProjectTranslation
{
    public int ProjectId { get; set; }
    public Project? Project { get; set; }

    public int LanguageId { get; set; }
    public Language? Language { get; set; }

    [Required]
    [MaxLength(300)]
    public string Title { get; set; } = default!;

    [MaxLength(500)]
    public string? Subtitle { get; set; }

    /// <summary>Rich text body (HTML from editor).</summary>
    public string? BodyHtml { get; set; }
}

public class ProjectGalleryImage
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public Project? Project { get; set; }

    [Required]
    [MaxLength(500)]
    public string ImageUrl { get; set; } = default!;

    public int SortOrder { get; set; }

    [MaxLength(300)]
    public string? Caption { get; set; }
}
