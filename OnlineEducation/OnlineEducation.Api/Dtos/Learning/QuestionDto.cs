using OnlineEducation.Api.Enums;
namespace OnlineEducation.Api.Dtos.Learning;

public class QuestionDto
{
    public int Id { get; set; }
    public string Text { get; set; }
    public QuestionType Type { get; set; }
    public int Order { get; set; }
    public List<OptionDto> Options { get; set; } = new();
}