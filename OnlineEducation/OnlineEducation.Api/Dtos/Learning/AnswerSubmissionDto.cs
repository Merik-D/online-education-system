using System.ComponentModel.DataAnnotations;

namespace OnlineEducation.Api.Dtos.Learning;

public class AnswerSubmissionDto
{
    [Required]
    public int QuestionId { get; set; }

    public string? AnswerText { get; set; }

    public List<int> SelectedOptionIds { get; set; } = new();
}