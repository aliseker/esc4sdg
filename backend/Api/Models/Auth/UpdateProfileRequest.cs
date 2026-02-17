using System.ComponentModel.DataAnnotations;

namespace backend.Api.Models.Auth;

public sealed class UpdateProfileRequest
{
    [MaxLength(120)]
    public string? DisplayName { get; set; }
}
