using System.ComponentModel.DataAnnotations;

namespace PaintShopBackEnd.WebApi.Models.Auth;

public sealed class LoginRequest
{
    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
