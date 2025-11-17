using OnlineEducation.Api.Enums;

namespace OnlineEducation.Api.Dtos.Learning;

public class AnswerDetailDto
{
    public int QuestionId { get; set; }
    public string QuestionText { get; set; }
    public QuestionType QuestionType { get; set; }

    public string? StudentAnswerText { get; set; }
    public List<OptionDto> StudentSelectedOptions { get; set; } = new();

    public List<OptionDto> CorrectOptions { get; set; } = new();

    public bool IsCorrect { get; set; }
}
