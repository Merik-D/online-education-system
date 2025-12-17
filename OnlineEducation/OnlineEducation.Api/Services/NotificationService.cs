using Microsoft.AspNetCore.SignalR;
using OnlineEducation.Api.Hubs;

namespace OnlineEducation.Api.Services;

/// <summary>
/// Service for sending real-time notifications via SignalR
/// </summary>
public interface INotificationService
{
    /// <summary>
    /// Send a notification to a specific user
    /// </summary>
    Task NotifyUserAsync(string userId, string title, string message, string type = "info");

    /// <summary>
    /// Send a test grade notification to a user
    /// </summary>
    Task NotifyTestGradedAsync(string userId, int testId, string testName, double score, double maxScore);

    /// <summary>
    /// Broadcast a course announcement to all course members
    /// </summary>
    Task NotifyCourseAnnouncementAsync(int courseId, string title, string message, string instructorName);

    /// <summary>
    /// Notify a user when they've been enrolled in a course
    /// </summary>
    Task NotifyEnrollmentAsync(string userId, int courseId, string courseName);

    /// <summary>
    /// Notify when a new course material is available
    /// </summary>
    Task NotifyNewMaterialAsync(int courseId, int moduleId, string materialTitle);

    /// <summary>
    /// Send a message to all users in a test group (for live proctoring scenarios)
    /// </summary>
    Task NotifyTestGroupAsync(int testId, string message);
}

public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(IHubContext<NotificationHub> hubContext, ILogger<NotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task NotifyUserAsync(string userId, string title, string message, string type = "info")
    {
        try
        {
            var notification = new
            {
                Title = title,
                Message = message,
                Type = type,
                Timestamp = DateTime.UtcNow
            };

            _logger.LogInformation("Sending notification to user {UserId}: {Title}", userId, title);
            await _hubContext.Clients.Group($"user_{userId}").SendAsync("ReceiveNotification", notification);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification to user {UserId}", userId);
        }
    }

    public async Task NotifyTestGradedAsync(string userId, int testId, string testName, double score, double maxScore)
    {
        try
        {
            var notification = new
            {
                Title = "Test Graded",
                Message = $"Your test '{testName}' has been graded",
                TestId = testId,
                Score = score,
                MaxScore = maxScore,
                Percentage = Math.Round((score / maxScore) * 100, 2),
                Type = "success",
                Timestamp = DateTime.UtcNow
            };

            _logger.LogInformation("Sending test graded notification to user {UserId} for test {TestId}", userId, testId);
            await _hubContext.Clients.Group($"user_{userId}").SendAsync("TestGraded", notification);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending test graded notification to user {UserId}", userId);
        }
    }

    public async Task NotifyCourseAnnouncementAsync(int courseId, string title, string message, string instructorName)
    {
        try
        {
            var notification = new
            {
                CourseId = courseId,
                Title = title,
                Message = message,
                InstructorName = instructorName,
                Type = "info",
                Timestamp = DateTime.UtcNow
            };

            _logger.LogInformation("Broadcasting course announcement to course {CourseId}", courseId);
            await _hubContext.Clients.Group($"course_{courseId}").SendAsync("CourseAnnouncement", notification);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting course announcement for course {CourseId}", courseId);
        }
    }

    public async Task NotifyEnrollmentAsync(string userId, int courseId, string courseName)
    {
        try
        {
            var notification = new
            {
                Title = "Course Enrolled",
                Message = $"You've been enrolled in '{courseName}'",
                CourseId = courseId,
                Type = "success",
                Timestamp = DateTime.UtcNow
            };

            _logger.LogInformation("Sending enrollment notification to user {UserId} for course {CourseId}", userId, courseId);
            await _hubContext.Clients.Group($"user_{userId}").SendAsync("EnrollmentConfirmed", notification);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending enrollment notification to user {UserId}", userId);
        }
    }

    public async Task NotifyNewMaterialAsync(int courseId, int moduleId, string materialTitle)
    {
        try
        {
            var notification = new
            {
                CourseId = courseId,
                ModuleId = moduleId,
                Title = "New Material Available",
                Message = $"New material available: {materialTitle}",
                Type = "info",
                Timestamp = DateTime.UtcNow
            };

            _logger.LogInformation("Broadcasting new material notification for course {CourseId}, module {ModuleId}", courseId, moduleId);
            await _hubContext.Clients.Group($"course_{courseId}").SendAsync("NewMaterialAvailable", notification);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending new material notification for course {CourseId}", courseId);
        }
    }

    public async Task NotifyTestGroupAsync(int testId, string message)
    {
        try
        {
            var notification = new
            {
                TestId = testId,
                Message = message,
                Timestamp = DateTime.UtcNow
            };

            _logger.LogInformation("Broadcasting message to test group {TestId}", testId);
            await _hubContext.Clients.Group($"test_{testId}").SendAsync("TestGroupMessage", notification);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting test group message for test {TestId}", testId);
        }
    }
}
