using Microsoft.EntityFrameworkCore;
using OnlineEducation.Api.Data;
using OnlineEducation.Api.Dtos.Courses;
using OnlineEducation.Api.Dtos.Learning;
using OnlineEducation.Api.Enums;
using OnlineEducation.Api.Interfaces;
using OnlineEducation.Api.Models;
using OnlineEducation.Api.Models.Lessons;

namespace OnlineEducation.Api.Services;

public class LearningService : ILearningService
{
    private readonly ApplicationDbContext _context;
    private readonly IGradingStrategyFactory _strategyFactory;

    public LearningService(ApplicationDbContext context, IGradingStrategyFactory strategyFactory)
    {
        _context = context;
        _strategyFactory = strategyFactory;
    }

    public async Task EnrollInCourseAsync(int courseId, int userId)
    {
        var courseExists = await _context.Courses.AnyAsync(c => c.Id == courseId);
        if (!courseExists)
        {
            throw new KeyNotFoundException("Course not found");
        }

        var alreadyEnrolled = await _context.Enrollments
            .AnyAsync(e => e.CourseId == courseId && e.StudentId == userId);

        if (alreadyEnrolled)
        {
            throw new InvalidOperationException("You are already enrolled in this course");
        }

        var enrollment = new Enrollment
        {
            CourseId = courseId,
            StudentId = userId,
            EnrollmentDate = DateTime.UtcNow,
            Progress = 0
        };

        await _context.Enrollments.AddAsync(enrollment);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<CourseDto>> GetMyCoursesAsync(int userId)
    {
        return await _context.Enrollments
            .Where(e => e.StudentId == userId)
            .Select(e => e.Course)
            .Select(c => new CourseDto
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Level = c.Level.ToString(),
                InstructorId = c.InstructorId,
                CategoryId = c.CategoryId
            })
            .ToListAsync();
    }

    public async Task<MyCourseDetailsDto?> GetCourseDetailsAsync(int courseId, int userId)
    {
        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.StudentId == userId && e.CourseId == courseId);

        if (enrollment == null)
        {
            // return null, for controller (403 Forbid)
            return null;
        }

        return await _context.Courses
            .Where(c => c.Id == courseId)
            .Select(c => new MyCourseDetailsDto
            {
                CourseId = c.Id,
                Title = c.Title,
                Progress = enrollment.Progress,
                Modules = c.Modules.OrderBy(m => m.Order).Select(m => new ModuleDto
                {
                    Id = m.Id,
                    Title = m.Title,
                    Order = m.Order,
                    Lessons = m.Lessons.OrderBy(l => l.Order).Select(l => new LessonDto
                    {
                        Id = l.Id,
                        Title = l.Title,
                        Order = l.Order,
                        VideoUrl = (l as VideoLesson) != null ? ((VideoLesson)l).VideoUrl : null,
                        TextContent = (l as TextLesson) != null ? ((TextLesson)l).TextContent : null
                    }).ToList()
                }).ToList()
            })
            .FirstOrDefaultAsync();
    }

    public async Task<GradingResultDto> SubmitTestAsync(int testId, int userId, TestSubmissionDto submissionDto)
    {
        var test = await _context.Tests
            .Include(t => t.Module)
            .FirstOrDefaultAsync(t => t.Id == testId);

        if (test == null)
        {
            throw new KeyNotFoundException("Test not found.");
        }

        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.StudentId == userId && e.CourseId == test.Module.CourseId);

        if (enrollment == null)
        {
            throw new InvalidOperationException("You are not enrolled in the course that contains this test.");
        }

        var submission = new StudentSubmission
        {
            StudentId = userId,
            TestId = testId,
            Status = SubmissionStatus.Pending
        };

        foreach (var answerDto in submissionDto.Answers)
        {
            var studentAnswer = new StudentAnswer
            {
                QuestionId = answerDto.QuestionId,
                AnswerText = answerDto.AnswerText
            };

            foreach (var optionId in answerDto.SelectedOptionIds)
            {
                studentAnswer.SelectedOptions.Add(new StudentAnswerOption
                {
                    OptionId = optionId
                });
            }
            submission.Answers.Add(studentAnswer);
        }

        await _context.StudentSubmissions.AddAsync(submission);

        var strategy = _strategyFactory.GetStrategy(test.StrategyType);
        await strategy.GradeAsync(submission);

        await _context.SaveChangesAsync();

        return new GradingResultDto
        {
            SubmissionId = submission.Id,
            Status = submission.Status,
            Score = submission.Score
        };
    }
}