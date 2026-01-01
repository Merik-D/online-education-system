using System.ComponentModel.DataAnnotations;
namespace OnlineEducation.Api.Dtos.Auth;
public class RegisterDto
{
    [Required]
    public string FullName { get; set; }
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    [Required]
    public string Password { get; set; }
    [Required]
    public string ConfirmPassword { get; set; }
    [Required]
    public string Role { get; set; }
}