using System.ComponentModel.DataAnnotations;

namespace backend.Api.Models.Auth;

public sealed class RegisterRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = default!;

    [MaxLength(60)]
    public string? Username { get; set; }

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = default!;

    [MaxLength(120)]
    public string? DisplayName { get; set; }

    [MaxLength(40)]
    public string? Gender { get; set; }

    public int? Age { get; set; }

    [MaxLength(150)]
    public string? School { get; set; }
}
