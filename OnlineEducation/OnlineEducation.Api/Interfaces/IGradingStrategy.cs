using OnlineEducation.Api.Enums;
using OnlineEducation.Api.Models;
namespace OnlineEducation.Api.Interfaces;
public interface IGradingStrategy
{
    GradingStrategyType StrategyType { get; }
    Task GradeAsync(StudentSubmission submission);
}