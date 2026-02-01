using System.ComponentModel.DataAnnotations;

namespace backend.Api.Models.Auth;

public sealed class LoginRequest
{
    [Required]
    public string EmailOrUsername { get; set; } = default!;

    [Required]
    public string Password { get; set; } = default!;
}
