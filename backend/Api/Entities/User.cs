using System.ComponentModel.DataAnnotations;

namespace backend.Api.Entities;

public class User
{
    public Guid Id { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = default!;

    [Required]
    public string NormalizedEmail { get; set; } = default!;

    [Required]
    [MaxLength(60)]
    public string Username { get; set; } = default!;

    [Required]
    public string NormalizedUsername { get; set; } = default!;

    [Required]
    public string PasswordHash { get; set; } = default!;

    [MaxLength(120)]
    public string? DisplayName { get; set; }

    [MaxLength(40)]
    public string? Gender { get; set; }

    public int? Age { get; set; }

    [MaxLength(150)]
    public string? School { get; set; }

    public int RoleId { get; set; }
    public Role? Role { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
