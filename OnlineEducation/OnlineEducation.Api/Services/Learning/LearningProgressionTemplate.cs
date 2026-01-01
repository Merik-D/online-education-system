using OnlineEducation.Api.Data;
using OnlineEducation.Api.Models;
using Microsoft.EntityFrameworkCore;
namespace OnlineEducation.Api.Services.Learning;
public abstract class LearningProgressionTemplate
{
    protected readonly ApplicationDbContext _context;
    protected readonly ILogger _logger;
    protected LearningProgressionTemplate(ApplicationDbContext context, ILogger logger)
    {
        _context = context;
        _logger = logger;
    }
    public async Task<(bool success, string? error)> ExecuteLearningProgressionAsync(
        int studentId,
        int lessonId)
    {
        try
        {
            if (!await ValidatePrerequisites(studentId, lessonId))
            {
                return (false, "Prerequisites not met");
            }
            await StartLesson(studentId, lessonId);
            await TrackProgress(studentId, lessonId);
            await CompleteLesson(studentId, lessonId);
            await OnLessonCompleted(studentId, lessonId);
            return (true, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in learning progression for student {StudentId}, lesson {LessonId}",
                studentId, lessonId);
            return (false, ex.Message);
        }
    }
    protected abstract Task<bool> ValidatePrerequisites(int studentId, int lessonId);
    protected abstract Task StartLesson(int studentId, int lessonId);
    protected abstract Task CompleteLesson(int studentId, int lessonId);
    protected virtual async Task TrackProgress(int studentId, int lessonId)
    {
        _logger.LogInformation("Tracking progress for student {StudentId}, lesson {LessonId}",
            studentId, lessonId);
        await Task.CompletedTask;
    }
    protected virtual async Task OnLessonCompleted(int studentId, int lessonId)
    {
        var lesson = await _context.Lessons
            .Include(l => l.Module)
            .ThenInclude(m => m.Course)
            .FirstOrDefaultAsync(l => l.Id == lessonId);
        if (lesson != null)
        {
            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == lesson.Module.CourseId);
            if (enrollment != null)
            {
                var totalLessons = await _context.Lessons
                    .Where(l => l.Module.CourseId == lesson.Module.CourseId)
                    .CountAsync();
                var completedLessons = await _context.LessonCompletions
                    .Where(lc => lc.StudentId == studentId &&
                                 lc.Lesson.Module.CourseId == lesson.Module.CourseId)
                    .CountAsync();
                enrollment.Progress = totalLessons > 0
                    ? Math.Round((double)completedLessons / totalLessons * 100, 2)
                    : 0;
                await _context.SaveChangesAsync();
            }
        }
    }
}
public class VideoLessonProgression : LearningProgressionTemplate
{
    public VideoLessonProgression(ApplicationDbContext context, ILogger<VideoLessonProgression> logger)
        : base(context, logger)
    {
    }
    protected override async Task<bool> ValidatePrerequisites(int studentId, int lessonId)
    {
        var lesson = await _context.Lessons
            .Include(l => l.Module)
            .FirstOrDefaultAsync(l => l.Id == lessonId);
        if (lesson == null) return false;
        var isEnrolled = await _context.Enrollments
            .AnyAsync(e => e.StudentId == studentId && e.CourseId == lesson.Module.CourseId);
        return isEnrolled;
    }
    protected override async Task StartLesson(int studentId, int lessonId)
    {
        _logger.LogInformation("Student {StudentId} started video lesson {LessonId}", studentId, lessonId);
        await Task.CompletedTask;
    }
    protected override async Task TrackProgress(int studentId, int lessonId)
    {
        _logger.LogInformation("Tracking video watch progress for student {StudentId}", studentId);
        await base.TrackProgress(studentId, lessonId);
    }
    protected override async Task CompleteLesson(int studentId, int lessonId)
    {
        _logger.LogInformation("Student {StudentId} completed video lesson {LessonId}", studentId, lessonId);
        var existingCompletion = await _context.LessonCompletions
            .FirstOrDefaultAsync(lc => lc.StudentId == studentId && lc.LessonId == lessonId);
        if (existingCompletion == null)
        {
            var completion = new LessonCompletion
            {
                StudentId = studentId,
                LessonId = lessonId,
                CompletedAt = DateTime.UtcNow
            };
            _context.LessonCompletions.Add(completion);
            await _context.SaveChangesAsync();
        }
    }
}
public class TextLessonProgression : LearningProgressionTemplate
{
    public TextLessonProgression(ApplicationDbContext context, ILogger<TextLessonProgression> logger)
        : base(context, logger)
    {
    }
    protected override async Task<bool> ValidatePrerequisites(int studentId, int lessonId)
    {
        var lesson = await _context.Lessons
            .Include(l => l.Module)
            .FirstOrDefaultAsync(l => l.Id == lessonId);
        if (lesson == null) return false;
        var isEnrolled = await _context.Enrollments
            .AnyAsync(e => e.StudentId == studentId && e.CourseId == lesson.Module.CourseId);
        return isEnrolled;
    }
    protected override async Task StartLesson(int studentId, int lessonId)
    {
        _logger.LogInformation("Student {StudentId} started text lesson {LessonId}", studentId, lessonId);
        await Task.CompletedTask;
    }
    protected override async Task TrackProgress(int studentId, int lessonId)
    {
        _logger.LogInformation("Tracking reading progress for student {StudentId}", studentId);
        await base.TrackProgress(studentId, lessonId);
    }
    protected override async Task CompleteLesson(int studentId, int lessonId)
    {
        _logger.LogInformation("Student {StudentId} completed text lesson {LessonId}", studentId, lessonId);
        var existingCompletion = await _context.LessonCompletions
            .FirstOrDefaultAsync(lc => lc.StudentId == studentId && lc.LessonId == lessonId);
        if (existingCompletion == null)
        {
            var completion = new LessonCompletion
            {
                StudentId = studentId,
                LessonId = lessonId,
                CompletedAt = DateTime.UtcNow
            };
            _context.LessonCompletions.Add(completion);
            await _context.SaveChangesAsync();
        }
    }
    protected override async Task OnLessonCompleted(int studentId, int lessonId)
    {
        await base.OnLessonCompleted(studentId, lessonId);
        _logger.LogInformation("Text lesson completion hooks executed");
    }
}