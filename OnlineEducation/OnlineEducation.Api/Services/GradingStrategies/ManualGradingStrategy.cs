using OnlineEducation.Api.Enums;
using OnlineEducation.Api.Interfaces;
using OnlineEducation.Api.Models;
namespace OnlineEducation.Api.Services.GradingStrategies;
public class ManualGradingStrategy : IGradingStrategy
{
    public GradingStrategyType StrategyType => GradingStrategyType.Manual;
    public Task GradeAsync(StudentSubmission submission)
    {
        submission.Status = SubmissionStatus.PendingReview;
        submission.Score = null;
        return Task.CompletedTask;
    }
}