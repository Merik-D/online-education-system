using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace OnlineEducation.Api.Hubs;

/// <summary>
/// SignalR Hub for real-time notifications to students and instructors
/// </summary>
[Authorize]
public class NotificationHub : Hub
{
    private readonly ILogger<NotificationHub> _logger;

    public NotificationHub(ILogger<NotificationHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst("sub")?.Value ?? Context.ConnectionId;
        _logger.LogInformation("User {UserId} connected to notifications hub. Connection: {ConnectionId}", userId, Context.ConnectionId);
        
        // Add user to their personal group
        await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
        
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst("sub")?.Value ?? Context.ConnectionId;
        _logger.LogInformation("User {UserId} disconnected from notifications hub. Connection: {ConnectionId}", userId, Context.ConnectionId);
        
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Join a course notification group (so instructor can broadcast to all course subscribers)
    /// </summary>
    public async Task JoinCourseGroup(int courseId)
    {
        var userId = Context.User?.FindFirst("sub")?.Value ?? Context.ConnectionId;
        var groupName = $"course_{courseId}";
        
        _logger.LogInformation("User {UserId} joined course group: {GroupName}", userId, groupName);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        
        // Notify group that user joined
        await Clients.Group(groupName).SendAsync("UserJoinedCourse", new
        {
            UserId = userId,
            CourseId = courseId,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Leave a course notification group
    /// </summary>
    public async Task LeaveCourseGroup(int courseId)
    {
        var userId = Context.User?.FindFirst("sub")?.Value ?? Context.ConnectionId;
        var groupName = $"course_{courseId}";
        
        _logger.LogInformation("User {UserId} left course group: {GroupName}", userId, groupName);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
    }

    /// <summary>
    /// Join a test group to receive real-time test notifications
    /// </summary>
    public async Task JoinTestGroup(int testId)
    {
        var userId = Context.User?.FindFirst("sub")?.Value ?? Context.ConnectionId;
        var groupName = $"test_{testId}";
        
        _logger.LogInformation("User {UserId} joined test group: {GroupName}", userId, groupName);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    }

    /// <summary>
    /// Leave a test group
    /// </summary>
    public async Task LeaveTestGroup(int testId)
    {
        var userId = Context.User?.FindFirst("sub")?.Value ?? Context.ConnectionId;
        var groupName = $"test_{testId}";
        
        _logger.LogInformation("User {UserId} left test group: {GroupName}", userId, groupName);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
    }

    /// <summary>
    /// Send a message to a specific user
    /// </summary>
    public async Task SendPrivateMessage(string userId, string message)
    {
        var senderUserId = Context.User?.FindFirst("sub")?.Value ?? Context.ConnectionId;
        _logger.LogInformation("Private message from {SenderId} to {ReceiverId}", senderUserId, userId);
        
        await Clients.Group($"user_{userId}").SendAsync("ReceivePrivateMessage", new
        {
            FromUserId = senderUserId,
            Message = message,
            Timestamp = DateTime.UtcNow
        });
    }
}
