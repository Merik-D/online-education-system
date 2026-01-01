using OnlineEducation.Api.Enums;
namespace OnlineEducation.Api.Dtos.Learning;
public class SubmissionResultDto
{
    public int SubmissionId { get; set; }
    public string TestTitle { get; set; }
    public SubmissionStatus Status { get; set; }
    public double? Score { get; set; }
    public List<AnswerDetailDto> Answers { get; set; } = new();
}