using System.ComponentModel.DataAnnotations;

namespace backend.Api.Models.Auth;

public class ForgotPasswordRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = default!;
}
