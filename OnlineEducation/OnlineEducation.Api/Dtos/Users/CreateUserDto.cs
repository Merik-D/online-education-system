using System.ComponentModel.DataAnnotations;

namespace OnlineEducation.Api.Dtos.Users;

public class CreateUserDto
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    public string Password { get; set; }
}