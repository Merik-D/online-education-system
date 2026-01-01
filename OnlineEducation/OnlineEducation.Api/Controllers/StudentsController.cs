using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineEducation.Api.Data;
using OnlineEducation.Api.Dtos.Students;
using OnlineEducation.Api.Extensions;
namespace OnlineEducation.Api.Controllers;
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Student,Admin,Instructor")]
public class StudentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    public StudentsController(ApplicationDbContext context)
    {
        _context = context;
    }
    [HttpGet("profile")]
    [Authorize]
    public async Task<ActionResult<StudentProfileDto>> GetMyProfile()
    {
        var userId = User.GetUserId();
        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return NotFound();
        var enrolled = await _context.Enrollments.AsNoTracking().CountAsync(e => e.StudentId == userId);
        var certs = await _context.Certificates.AsNoTracking().CountAsync(c => c.StudentId == userId);
        return Ok(new StudentProfileDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName ?? string.Empty,
            EnrolledCourses = enrolled,
            CertificatesCount = certs
        });
    }
    [HttpGet("progress")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<CourseProgressDto>>> GetMyProgress()
    {
        var userId = User.GetUserId();
        var progress = await _context.Enrollments.AsNoTracking()
            .Where(e => e.StudentId == userId)
            .Include(e => e.Course)
            .Select(e => new CourseProgressDto
            {
                CourseId = e.CourseId,
                Title = e.Course!.Title,
                Progress = e.Progress
            })
            .ToListAsync();
        return Ok(progress);
    }
}