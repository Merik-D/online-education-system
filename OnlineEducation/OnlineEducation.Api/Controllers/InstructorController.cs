using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineEducation.Api.Dtos.Admin;
using OnlineEducation.Api.Dtos.Analytics;
using OnlineEducation.Api.Data;
using Microsoft.EntityFrameworkCore;
using OnlineEducation.Api.Interfaces;
using OnlineEducation.Api.Extensions;
namespace OnlineEducation.Api.Controllers;
[Route("api/instructor")]
[ApiController]
[Authorize(Roles = "Instructor")]
public class InstructorController : ControllerBase
{
    private readonly IInstructorService _instructorService;
    private readonly ApplicationDbContext _context;
    public InstructorController(IInstructorService instructorService, ApplicationDbContext context)
    {
        _instructorService = instructorService;
        _context = context;
    }
    [HttpGet("submissions/pending")]
    public async Task<ActionResult<IEnumerable<PendingSubmissionDto>>> GetPendingSubmissions()
    {
        var submissions = await _instructorService.GetPendingSubmissionsAsync();
        return Ok(submissions);
    }
    [HttpPost("submissions/{id}/grade")]
    public async Task<IActionResult> GradeSubmission(int id, [FromBody] GradeSubmissionDto gradeDto)
    {
        var result = await _instructorService.GradeSubmissionAsync(id, gradeDto);
        if (!result)
        {
            return NotFound(new { message = "Submission not found or already graded." });
        }
        return Ok(new { message = "Submission graded successfully." });
    }
    [HttpGet("statistics")]
    public async Task<ActionResult<InstructorStatisticsDto>> GetStatistics()
    {
        var instructorId = User.GetUserId();
        var coursesQuery = _context.Courses.AsNoTracking().Where(c => c.InstructorId == instructorId);
        var totalCourses = await coursesQuery.CountAsync();
        var courseIds = await coursesQuery.Select(c => c.Id).ToListAsync();
        var totalStudents = await _context.Enrollments.AsNoTracking()
            .Where(e => courseIds.Contains(e.CourseId))
            .Select(e => e.StudentId)
            .Distinct()
            .CountAsync();
        var averageRating = await _context.Reviews.AsNoTracking()
            .Where(r => courseIds.Contains(r.CourseId))
            .Select(r => (double?)r.Rating)
            .AverageAsync() ?? 0.0;
        var dto = new InstructorStatisticsDto
        {
            InstructorId = instructorId,
            TotalCourses = totalCourses,
            TotalStudents = totalStudents,
            AverageCourseRating = Math.Round(averageRating, 2)
        };
        return Ok(dto);
    }
}