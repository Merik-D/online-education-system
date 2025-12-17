using OnlineEducation.Api.Data;
using OnlineEducation.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace OnlineEducation.Api.Services.Learning;

/// <summary>
/// Template Method Pattern: Defines the skeleton of learning progression algorithm
/// Subclasses can override specific steps without changing the overall structure
/// </summary>
public abstract class LearningProgressionTemplate
{
    protected readonly ApplicationDbContext _context;
    protected readonly ILogger _logger;

    protected LearningProgressionTemplate(ApplicationDbContext context, ILogger logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Template Method: Defines the standard learning progression flow
    /// This is the algorithm skeleton that cannot be changed by subclasses
    /// </summary>
    public async Task<(bool success, string? error)> ExecuteLearningProgressionAsync(
        int studentId, 
        int lessonId)
    {
        try
        {
            // Step 1: Validate prerequisites
            if (!await ValidatePrerequisites(studentId, lessonId))
            {
                return (false, "Prerequisites not met");
            }

            // Step 2: Start lesson
            await StartLesson(studentId, lessonId);

            // Step 3: Track progress (hook method - can be customized)
            await TrackProgress(studentId, lessonId);

            // Step 4: Mark as complete
            await CompleteLesson(studentId, lessonId);

            // Step 5: Post-completion hook (optional)
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

    // Primitive operations that must be implemented by subclasses
    protected abstract Task<bool> ValidatePrerequisites(int studentId, int lessonId);
    protected abstract Task StartLesson(int studentId, int lessonId);
    protected abstract Task CompleteLesson(int studentId, int lessonId);

    // Hook methods - can be overridden but have default implementations
    protected virtual async Task TrackProgress(int studentId, int lessonId)
    {
        // Default implementation: simple logging
        _logger.LogInformation("Tracking progress for student {StudentId}, lesson {LessonId}", 
            studentId, lessonId);
        await Task.CompletedTask;
    }

    protected virtual async Task OnLessonCompleted(int studentId, int lessonId)
    {
        // Default implementation: update course progress
        var lesson = await _context.Lessons
            .Include(l => l.Module)
            .ThenInclude(m => m.Course)
            .ThenInclude(c => c.Enrollments)
            .FirstOrDefaultAsync(l => l.Id == lessonId);

        if (lesson != null)
        {
            var enrollment = lesson.Module.Course.Enrollments
                .FirstOrDefault(e => e.StudentId == studentId);

            if (enrollment != null)
            {
                // Calculate progress based on completed lessons
                var totalLessons = await _context.Lessons
                    .Where(l => l.Module.CourseId == lesson.Module.CourseId)
                    .CountAsync();

                // This is simplified - in real app would track actual completion
                enrollment.Progress = Math.Min(enrollment.Progress + (100.0 / totalLessons), 100);
                await _context.SaveChangesAsync();
            }
        }
    }
}

/// <summary>
/// Concrete implementation: Video lesson progression
/// </summary>
public class VideoLessonProgression : LearningProgressionTemplate
{
    public VideoLessonProgression(ApplicationDbContext context, ILogger<VideoLessonProgression> logger) 
        : base(context, logger)
    {
    }

    protected override async Task<bool> ValidatePrerequisites(int studentId, int lessonId)
    {
        // Check if student is enrolled in the course
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
        // Could create a LessonProgress entity here
        await Task.CompletedTask;
    }

    protected override async Task TrackProgress(int studentId, int lessonId)
    {
        // Video-specific tracking: could track watch time, rewinds, etc.
        _logger.LogInformation("Tracking video watch progress for student {StudentId}", studentId);
        await base.TrackProgress(studentId, lessonId);
    }

    protected override async Task CompleteLesson(int studentId, int lessonId)
    {
        _logger.LogInformation("Student {StudentId} completed video lesson {LessonId}", studentId, lessonId);
        // Mark video as watched
        await Task.CompletedTask;
    }
}

/// <summary>
/// Concrete implementation: Text lesson progression
/// </summary>
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
        // Text-specific tracking: could track reading time, scroll position, etc.
        _logger.LogInformation("Tracking reading progress for student {StudentId}", studentId);
        await base.TrackProgress(studentId, lessonId);
    }

    protected override async Task CompleteLesson(int studentId, int lessonId)
    {
        _logger.LogInformation("Student {StudentId} completed text lesson {LessonId}", studentId, lessonId);
        // Mark text as read
        await Task.CompletedTask;
    }

    protected override async Task OnLessonCompleted(int studentId, int lessonId)
    {
        // Text lessons might have additional completion logic
        await base.OnLessonCompleted(studentId, lessonId);
        _logger.LogInformation("Text lesson completion hooks executed");
    }
}
