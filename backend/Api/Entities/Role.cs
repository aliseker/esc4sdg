using System.ComponentModel.DataAnnotations;

namespace backend.Api.Entities;

public class Role
{
    public int Id { get; set; }

    [Required]
    [MaxLength(60)]
    public string Name { get; set; } = default!;

    public ICollection<User> Users { get; set; } = new List<User>();
}
