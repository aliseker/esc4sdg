using System.ComponentModel.DataAnnotations;

namespace backend.Api.Entities;

public class Course
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Slug { get; set; } = default!;

    [MaxLength(100)]
    public string? Category { get; set; }

    [MaxLength(50)]
    public string? Level { get; set; }

    public int DurationMinutes { get; set; }

    [MaxLength(200)]
    public string? InstructorName { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public bool HasCertificate { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CourseTranslation> Translations { get; set; } = new List<CourseTranslation>();
    public ICollection<CourseModule> Modules { get; set; } = new List<CourseModule>();
}

public class CourseTranslation
{
    public int CourseId { get; set; }
    public Course? Course { get; set; }

    public int LanguageId { get; set; }
    public Language? Language { get; set; }

    [Required]
    [MaxLength(300)]
    public string Title { get; set; } = default!;

    public string? Summary { get; set; }

    [MaxLength(100)]
    public string? Category { get; set; }

    [MaxLength(50)]
    public string? Level { get; set; }
}
