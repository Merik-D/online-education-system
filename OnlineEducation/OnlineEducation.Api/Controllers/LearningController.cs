using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineEducation.Api.Data;
using OnlineEducation.Api.Dtos.Courses;
using OnlineEducation.Api.Dtos.Learning;
using OnlineEducation.Api.Extensions;
using OnlineEducation.Api.Models;

namespace OnlineEducation.Api.Controllers;

[Route("api/learning")]
[ApiController]
[Authorize]
public class LearningController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public LearningController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("courses/{courseId}/enroll")]
    public async Task<IActionResult> EnrollInCourse(int courseId)
    {
        var userId = User.GetUserId();

        var courseExists = await _context.Courses.AnyAsync(c => c.Id == courseId);
        if (!courseExists)
        {
            return NotFound(new { message = "Course not found" });
        }

        var alreadyEnrolled = await _context.Enrollments
            .AnyAsync(e => e.CourseId == courseId && e.StudentId == userId);

        if (alreadyEnrolled)
        {
            return BadRequest(new { message = "You are already enrolled in this course" });
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

        return Ok(new { message = "Successfully enrolled" });
    }

    [HttpGet("my-courses")]
    public async Task<ActionResult<IEnumerable<CourseDto>>> GetMyCourses()
    {
        var userId = User.GetUserId();

        var myCourses = await _context.Enrollments
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

        return Ok(myCourses);
    }

    [HttpGet("courses/{courseId}/details")]
    public async Task<ActionResult<MyCourseDetailsDto>> GetCourseDetails(int courseId)
    {
        var userId = User.GetUserId();

        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.StudentId == userId && e.CourseId == courseId);

        if (enrollment == null)
        {
            return Forbid("You are not enrolled in this course.");
        }

        var courseDetails = await _context.Courses
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
                        VideoUrl = l.VideoUrl,
                        TextContent = l.TextContent
                    }).ToList()
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (courseDetails == null)
        {
            return NotFound("Course details not found.");
        }

        return Ok(courseDetails);
    }

    // lessons enging and tests will be added later.
}