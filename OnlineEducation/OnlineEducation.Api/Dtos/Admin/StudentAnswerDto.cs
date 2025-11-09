using OnlineEducation.Api.Enums;

namespace OnlineEducation.Api.Dtos.Admin;

public class StudentAnswerDto
{
    public int QuestionId { get; set; }
    public string QuestionText { get; set; }
    public QuestionType QuestionType { get; set; }
    public string? AnswerText { get; set; }
    public List<SelectedOptionDto> SelectedOptions { get; set; } = new();
}