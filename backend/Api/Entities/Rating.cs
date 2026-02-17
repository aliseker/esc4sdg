using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Api.Entities;

public class Rating
{
    public int Id { get; set; }

    public Guid UserId { get; set; }
    public User? User { get; set; }

    public int CourseId { get; set; }
    [ForeignKey("CourseId")]
    public Course? Course { get; set; }

    [Range(1, 5)]
    public int Score { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
