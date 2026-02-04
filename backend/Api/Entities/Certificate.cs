namespace backend.Api.Entities;

public class Certificate
{
    public int Id { get; set; }

    public Guid UserId { get; set; }
    public User? User { get; set; }

    public int CourseId { get; set; }
    public Course? Course { get; set; }

    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
}
