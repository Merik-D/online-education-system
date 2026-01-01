using MediatR;
using OnlineEducation.Api.Data;
using OnlineEducation.Api.Events;
using OnlineEducation.Api.Models;
namespace OnlineEducation.Api.Handlers;
public class CreateNotificationHandler : INotificationHandler<TestGradedEvent>
{
    private readonly ApplicationDbContext _context;
    public CreateNotificationHandler(ApplicationDbContext context)
    {
        _context = context;
    }
    public async Task Handle(TestGradedEvent notificationEvent, CancellationToken cancellationToken)
    {
        var notification = new Notification
        {
            UserId = notificationEvent.StudentId,
            Title = $"Тест оцінено",
            Message = $"Ваш тест '{notificationEvent.TestTitle}' перевірено. Оцінка: {notificationEvent.Score}%",
        };
        await _context.Notifications.AddAsync(notification, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }
}