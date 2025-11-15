using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineEducation.Api.Dtos.Courses;
using OnlineEducation.Api.Dtos.Learning;
using OnlineEducation.Api.Extensions;
using OnlineEducation.Api.Interfaces;

namespace OnlineEducation.Api.Controllers;

[Route("api/learning")]
[ApiController]
[Authorize]
public class LearningController : ControllerBase
{
    private readonly ILearningService _learningService;

    public LearningController(ILearningService learningService)
    {
        _learningService = learningService;
    }

    [HttpPost("courses/{courseId}/enroll")]
    public async Task<IActionResult> EnrollInCourse(int courseId)
    {
        var userId = User.GetUserId();
        try
        {
            await _learningService.EnrollInCourseAsync(courseId, userId);
            return Ok(new { message = "Successfully enrolled" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("my-courses")]
    public async Task<ActionResult<IEnumerable<CourseDto>>> GetMyCourses()
    {
        var userId = User.GetUserId();
        var myCourses = await _learningService.GetMyCoursesAsync(userId);
        return Ok(myCourses);
    }

    [HttpGet("courses/{courseId}/details")]
    public async Task<ActionResult<MyCourseDetailsDto>> GetCourseDetails(int courseId)
    {
        var userId = User.GetUserId();

        var courseDetails = await _learningService.GetCourseDetailsAsync(courseId, userId);

        if (courseDetails == null)
        {
            return Forbid();
        }

        return Ok(courseDetails);
    }

    [HttpPost("test/{testId}/submit")]
    public async Task<ActionResult<GradingResultDto>> SubmitTest(int testId, [FromBody] TestSubmissionDto submissionDto)
    {
        var userId = User.GetUserId();
        try
        {
            var result = await _learningService.SubmitTestAsync(testId, userId, submissionDto);
            return Ok(result);
        }
        catch (Exception ex) when (ex is KeyNotFoundException or InvalidOperationException)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("lessons/{lessonId}")]
    public async Task<ActionResult<LessonDto>> GetLessonDetails(int lessonId)
    {
        var userId = User.GetUserId();

        try
        {
            var lessonDto = await _learningService.GetLessonDetailsAsync(lessonId, userId);

            if (lessonDto == null)
            {
                return Forbid("You are not enrolled in the course for this lesson.");
            }

            return Ok(lessonDto);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}