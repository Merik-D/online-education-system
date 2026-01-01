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
    private readonly ILearningProgressionFactory _progressionFactory;
    public LearningService(
        ApplicationDbContext context,
        IGradingStrategyFactory strategyFactory,
        ILearningProgressionFactory progressionFactory)
    {
        _context = context;
        _strategyFactory = strategyFactory;
        _progressionFactory = progressionFactory;
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
            return null;
        }
        var completedLessonIds = await _context.LessonCompletions
            .Where(lc => lc.StudentId == userId &&
                         lc.Lesson.Module.CourseId == courseId)
            .Select(lc => lc.LessonId)
            .ToListAsync();
        var completions = await _context.LessonCompletions
            .Where(lc => lc.StudentId == userId &&
                         lc.Lesson.Module.CourseId == courseId)
            .ToDictionaryAsync(lc => lc.LessonId, lc => lc.CompletedAt);
        var course = await _context.Courses
            .Where(c => c.Id == courseId)
            .Include(c => c.Modules.OrderBy(m => m.Order))
                .ThenInclude(m => m.Lessons.OrderBy(l => l.Order))
            .Include(c => c.Modules)
                .ThenInclude(m => m.Test)
            .FirstOrDefaultAsync();
        if (course == null)
        {
            return null;
        }
        var courseDetails = new MyCourseDetailsDto
        {
            CourseId = course.Id,
            Title = course.Title,
            Progress = enrollment.Progress,
            Modules = course.Modules.OrderBy(m => m.Order).Select(m => new ModuleDto
            {
                Id = m.Id,
                Title = m.Title,
                Order = m.Order,
                TotalLessonsCount = m.Lessons.Count,
                CompletedLessonsCount = m.Lessons.Count(l => completedLessonIds.Contains(l.Id)),
                Test = m.Test != null ? new TestDto
                {
                    Id = m.Test.Id,
                    Title = m.Test.Title
                } : null,
                Lessons = m.Lessons.OrderBy(l => l.Order).Select(l => new LessonDto
                {
                    Id = l.Id,
                    Title = l.Title,
                    Order = l.Order,
                    Type = l.Type,
                    VideoUrl = l is VideoLesson videoLesson ? videoLesson.VideoUrl : null,
                    TextContent = l is TextLesson textLesson ? textLesson.TextContent : null,
                    IsCompleted = completedLessonIds.Contains(l.Id),
                    CompletedAt = completions.ContainsKey(l.Id) ? completions[l.Id] : null
                }).ToList()
            }).ToList()
        };
        if (courseDetails != null)
        {
            courseDetails.TotalLessonsCount = courseDetails.Modules.Sum(m => m.TotalLessonsCount);
            courseDetails.CompletedLessonsCount = courseDetails.Modules.Sum(m => m.CompletedLessonsCount);
        }
        return courseDetails;
    }
    public async Task<GradingResultDto> SubmitTestAsync(int testId, int userId, TestSubmissionDto submissionDto)
    {
        var test = await _context.Tests.FindAsync(testId);
        if (test == null) throw new KeyNotFoundException("Test not found.");
        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.StudentId == userId && e.Course.Modules.Any(m => m.Test != null && m.Test.Id == testId));
        if (enrollment == null) throw new InvalidOperationException("You are not enrolled in this course.");
        var existingSubmission = await _context.StudentSubmissions
            .FirstOrDefaultAsync(s => s.StudentId == userId && s.TestId == testId);
        if (existingSubmission != null)
        {
            throw new InvalidOperationException("You have already submitted this test.");
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
    public async Task<LessonDto?> GetLessonDetailsAsync(int lessonId, int userId)
    {
        var lesson = await _context.Lessons
            .FirstOrDefaultAsync(l => l.Id == lessonId);
        if (lesson == null)
        {
            throw new KeyNotFoundException("Lesson not found");
        }
        var module = await _context.Modules.FindAsync(lesson.ModuleId);
        if (module == null)
        {
            throw new KeyNotFoundException("Module not found");
        }
        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.StudentId == userId && e.CourseId == module.CourseId);
        if (enrollment == null)
        {
            return null;
        }
        var lessonDto = new LessonDto
        {
            Id = lesson.Id,
            Title = lesson.Title,
            Order = lesson.Order,
            Type = lesson.Type,
            VideoUrl = (lesson as VideoLesson) != null ? ((VideoLesson)lesson).VideoUrl : null,
            TextContent = (lesson as TextLesson) != null ? ((TextLesson)lesson).TextContent : null
        };
        return lessonDto;
    }
    public async Task<TestDetailsDto?> GetTestDetailsAsync(int testId, int userId)
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
            return null;
        }
        var existingSubmission = await _context.StudentSubmissions
            .FirstOrDefaultAsync(s => s.StudentId == userId && s.TestId == testId);
        if (existingSubmission != null)
        {
            return await _context.Tests
                .Where(t => t.Id == testId)
                .Select(t => new TestDetailsDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    IsCompleted = true,
                    Score = existingSubmission.Score,
                    Questions = t.Questions.OrderBy(q => q.Order).Select(q => new QuestionDto
                    {
                        Id = q.Id,
                        Text = q.Text,
                        Type = q.Type,
                        Order = q.Order,
                        Options = new List<OptionDto>()
                    }).ToList()
                })
                .FirstOrDefaultAsync();
        }
        return await _context.Tests
            .Where(t => t.Id == testId)
            .Select(t => new TestDetailsDto
            {
                Id = t.Id,
                Title = t.Title,
                Questions = t.Questions.OrderBy(q => q.Order).Select(q => new QuestionDto
                {
                    Id = q.Id,
                    Text = q.Text,
                    Type = q.Type,
                    Order = q.Order,
                    Options = q.Options.Select(o => new OptionDto
                    {
                        Id = o.Id,
                        Text = o.Text
                    }).ToList()
                }).ToList()
            })
            .FirstOrDefaultAsync();
    }
    public async Task<(bool success, string? error)> CompleteLessonAsync(int lessonId, int userId)
    {
        var lesson = await _context.Lessons.FindAsync(lessonId);
        if (lesson == null)
        {
            return (false, "Lesson not found");
        }
        var progression = _progressionFactory.CreateProgression(lesson.Type);
        return await progression.ExecuteLearningProgressionAsync(userId, lessonId);
    }
}