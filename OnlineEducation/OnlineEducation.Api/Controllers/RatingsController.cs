using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineEducation.Api.Dtos.Courses;
using OnlineEducation.Api.Extensions;
using OnlineEducation.Api.Services;

namespace OnlineEducation.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RatingsController : ControllerBase
{
    private readonly IRatingService _ratingService;
    private readonly ILogger<RatingsController> _logger;

    public RatingsController(IRatingService ratingService, ILogger<RatingsController> logger)
    {
        _ratingService = ratingService;
        _logger = logger;
    }

    [HttpPost("submit")]
    [Authorize]
    public async Task<ActionResult<RatingDto>> SubmitRating([FromBody] CreateRatingDto ratingDto)
    {
        try
        {
            var studentId = User.GetUserId();
            var result = await _ratingService.AddRatingAsync(studentId, ratingDto.CourseId, ratingDto.Rating, ratingDto.Comment);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error submitting rating: {ex.Message}");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
        }
    }

    [HttpGet("instructor/{instructorId}")]
    public async Task<ActionResult<InstructorRatingDto>> GetInstructorRating(int instructorId)
    {
        try
        {
            var result = await _ratingService.GetInstructorRatingsAsync(instructorId);
            if (result == null)
                return NotFound(new { message = "No ratings found for this instructor" });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching instructor rating: {ex.Message}");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
        }
    }

    [HttpGet("course/{courseId}")]
    public async Task<ActionResult<List<RatingDto>>> GetCourseRatings(int courseId, [FromQuery] int pageSize = 10, [FromQuery] int pageNumber = 1)
    {
        try
        {
            var result = await _ratingService.GetCourseRatingsAsync(courseId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching course ratings: {ex.Message}");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
        }
    }

    [HttpDelete("{ratingId}")]
    [Authorize]
    public async Task<IActionResult> DeleteRating(int ratingId)
    {
        try
        {
            await _ratingService.DeleteRatingAsync(ratingId);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error deleting rating: {ex.Message}");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
        }
    }
}
