using Microsoft.EntityFrameworkCore;
using OnlineEducation.Api.Data;
using OnlineEducation.Api.Enums;
using OnlineEducation.Api.Interfaces;
using OnlineEducation.Api.Models;
namespace OnlineEducation.Api.Services.GradingStrategies;
public class AutoGradingStrategy : IGradingStrategy
{
    public GradingStrategyType StrategyType => GradingStrategyType.Auto;
    private readonly ApplicationDbContext _context;
    public AutoGradingStrategy(ApplicationDbContext context)
    {
        _context = context;
    }
    public async Task GradeAsync(StudentSubmission submission)
    {
        var questions = await _context.Questions
            .Include(q => q.Options)
            .Where(q => q.TestId == submission.TestId)
            .ToListAsync();
        double correctAnswers = 0;
        foreach (var studentAnswer in submission.Answers)
        {
            var question = questions.First(q => q.Id == studentAnswer.QuestionId);
            bool isCorrect = false;
            switch (question.Type)
            {
                case QuestionType.Text:
                case QuestionType.TrueFalse:
                    var correctAnswerText = question.Options.FirstOrDefault(o => o.IsCorrect)?.Text;
                    isCorrect = !string.IsNullOrEmpty(correctAnswerText) &&
                                 correctAnswerText.Equals(studentAnswer.AnswerText, StringComparison.OrdinalIgnoreCase);
                    break;
                case QuestionType.SingleChoice:
                    var correctOptionId = question.Options.FirstOrDefault(o => o.IsCorrect)?.Id;
                    var selectedOptionId = studentAnswer.SelectedOptions.FirstOrDefault()?.OptionId;
                    isCorrect = correctOptionId.HasValue && selectedOptionId.HasValue &&
                                 correctOptionId.Value == selectedOptionId.Value;
                    break;
                case QuestionType.MultipleChoice:
                    var correctOptionIds = question.Options
                        .Where(o => o.IsCorrect)
                        .Select(o => o.Id)
                        .ToHashSet();
                    var selectedOptionIds = studentAnswer.SelectedOptions
                        .Select(o => o.OptionId)
                        .ToHashSet();
                    isCorrect = correctOptionIds.SetEquals(selectedOptionIds);
                    break;
            }
            if (isCorrect)
            {
                correctAnswers++;
            }
        }
        submission.Status = SubmissionStatus.Graded;
        submission.Score = (correctAnswers / questions.Count) * 100.0;
    }
}