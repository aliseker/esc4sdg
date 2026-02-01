using System.ComponentModel.DataAnnotations;

namespace backend.Api.Models.Admin;

public sealed class AdminLoginRequest
{
    [Required]
    public string UsernameOrEmail { get; set; } = default!;

    [Required]
    public string Password { get; set; } = default!;
}
