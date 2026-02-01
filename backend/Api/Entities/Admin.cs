using System.ComponentModel.DataAnnotations;

namespace backend.Api.Entities;

public class Admin
{
    public int Id { get; set; }

    [Required]
    [MaxLength(80)]
    public string Username { get; set; } = default!;

    [Required]
    public string NormalizedUsername { get; set; } = default!;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = default!;

    [Required]
    public string NormalizedEmail { get; set; } = default!;

    [Required]
    public string PasswordHash { get; set; } = default!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
