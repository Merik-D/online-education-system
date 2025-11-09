using System.ComponentModel.DataAnnotations;

namespace OnlineEducation.Api.Dtos.Learning;

public class TestSubmissionDto
{
    [Required]
    public List<AnswerSubmissionDto> Answers { get; set; }
}