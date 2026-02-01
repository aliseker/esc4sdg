using System.ComponentModel.DataAnnotations;

namespace backend.Api.Models.Admin;

public sealed class AdminCreateRequest
{
    [Required]
    [MinLength(3)]
    public string Username { get; set; } = default!;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = default!;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = default!;
}
