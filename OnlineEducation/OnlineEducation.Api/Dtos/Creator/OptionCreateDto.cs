using System.ComponentModel.DataAnnotations;
namespace OnlineEducation.Api.Dtos.Creator;
public class OptionCreateDto
{
    [Required]
    public string Text { get; set; }
    public bool IsCorrect { get; set; } = false;
}