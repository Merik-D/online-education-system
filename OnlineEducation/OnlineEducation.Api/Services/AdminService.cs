using Microsoft.EntityFrameworkCore;
using OnlineEducation.Api.Data;
using OnlineEducation.Api.Dtos.Admin;
using OnlineEducation.Api.Enums;
using OnlineEducation.Api.Interfaces;

namespace OnlineEducation.Api.Services;

public class AdminService : IAdminService
{
    private readonly ApplicationDbContext _context;

    public AdminService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PendingSubmissionDto>> GetPendingSubmissionsAsync()
    {
        return await _context.StudentSubmissions
            .Where(s => s.Status == SubmissionStatus.PendingReview)
            .Include(s => s.Test)
            .Include(s => s.Student)
            .Include(s => s.Answers)
                .ThenInclude(a => a.Question)
            .Include(s => s.Answers)
                .ThenInclude(a => a.SelectedOptions)
                    .ThenInclude(so => so.Option)
            .OrderBy(s => s.SubmittedAt)
            .Select(s => new PendingSubmissionDto
            {
                SubmissionId = s.Id,
                TestTitle = s.Test.Title,
                StudentName = s.Student.FullName,
                SubmittedAt = s.SubmittedAt,
                Answers = s.Answers.Select(a => new StudentAnswerDto
                {
                    QuestionId = a.QuestionId,
                    QuestionText = a.Question.Text,
                    QuestionType = a.Question.Type,
                    AnswerText = a.AnswerText,
                    SelectedOptions = a.SelectedOptions.Select(so => new SelectedOptionDto
                    {
                        OptionId = so.OptionId,
                        OptionText = so.Option.Text
                    }).ToList()
                }).ToList()
            })
            .ToListAsync();
    }

    public async Task<bool> GradeSubmissionAsync(int submissionId, GradeSubmissionDto gradeDto)
    {
        var submission = await _context.StudentSubmissions.FindAsync(submissionId);

        if (submission == null || submission.Status != SubmissionStatus.PendingReview)
        {
            return false;
        }

        submission.Status = SubmissionStatus.Graded;
        submission.Score = gradeDto.Score;

        await _context.SaveChangesAsync();
        return true;
    }
}