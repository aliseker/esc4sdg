namespace backend.Api.Entities;

public class UserModuleItemProgress
{
    public Guid UserId { get; set; }
    public User? User { get; set; }

    public int ModuleItemId { get; set; }
    public ModuleItem? ModuleItem { get; set; }

    public DateTime? CompletedAt { get; set; }
    public int? ScorePercent { get; set; }
}
