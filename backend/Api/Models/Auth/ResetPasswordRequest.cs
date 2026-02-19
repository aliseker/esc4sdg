using System.ComponentModel.DataAnnotations;

namespace backend.Api.Models.Auth;

public class ResetPasswordRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = default!;

    [Required]
    public string Token { get; set; } = default!;

    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; } = default!;
}
