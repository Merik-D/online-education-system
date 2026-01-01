using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineEducation.Api.Data;
using OnlineEducation.Api.Extensions;
using OnlineEducation.Api.Models;
namespace OnlineEducation.Api.Controllers;
[Route("api/notifications")]
[ApiController]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    public NotificationsController(ApplicationDbContext context)
    {
        _context = context;
    }
    [HttpGet]
    public async Task<IActionResult> GetMyNotifications()
    {
        var userId = User.GetUserId();
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(20)
            .ToListAsync();
        return Ok(notifications);
    }
    [HttpPost("mark-all-read")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = User.GetUserId();
        var notificationsToUpdate = await _context.Notifications
            .Where(n => n.UserId == userId && n.IsRead == false)
            .ToListAsync();
        if (notificationsToUpdate.Any())
        {
            foreach (var notification in notificationsToUpdate)
            {
                notification.IsRead = true;
            }
            await _context.SaveChangesAsync();
        }
        return NoContent();
    }
    [HttpPost("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = User.GetUserId();
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
        if (notification == null)
        {
            return NotFound();
        }
        notification.IsRead = true;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}