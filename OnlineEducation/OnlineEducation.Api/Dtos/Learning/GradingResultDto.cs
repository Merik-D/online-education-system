using OnlineEducation.Api.Enums;

namespace OnlineEducation.Api.Dtos.Learning;

public class GradingResultDto
{
    public int SubmissionId { get; set; }
    public SubmissionStatus Status { get; set; }
    public double? Score { get; set; }
}