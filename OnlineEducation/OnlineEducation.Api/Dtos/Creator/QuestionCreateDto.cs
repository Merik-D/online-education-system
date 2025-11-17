using System.ComponentModel.DataAnnotations;
using OnlineEducation.Api.Enums;
namespace OnlineEducation.Api.Dtos.Creator;

public class QuestionCreateDto
{
    [Required]
    public string Text { get; set; }
    [Required]
    public QuestionType Type { get; set; }
    public int Order { get; set; }
    public List<OptionCreateDto> Options { get; set; } = new();
}