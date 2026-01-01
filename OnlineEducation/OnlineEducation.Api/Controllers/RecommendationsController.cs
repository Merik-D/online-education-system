using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineEducation.Api.Dtos.Courses;
using OnlineEducation.Api.Interfaces;
using OnlineEducation.Api.Models.Common;
using System.Security.Claims;
namespace OnlineEducation.Api.Controllers;
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RecommendationsController : ControllerBase
{
    private readonly IRecommendationService _recommendationService;
    public RecommendationsController(IRecommendationService recommendationService)
    {
        _recommendationService = recommendationService;
    }
    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
    }
    [HttpGet("my-recommendations")]
    [ProducesResponseType(typeof(ApiResponse<CourseRecommendationListDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetMyRecommendations([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var userId = GetUserId();
        if (userId == 0)
            return BadRequest(new ApiResponse<string> { Success = false, Message = "Unable to identify user" });
        var recommendations = await _recommendationService.GetRecommendationsAsync(userId, pageNumber, pageSize);
        return Ok(new ApiResponse<CourseRecommendationListDto>
        {
            Success = true,
            Data = recommendations,
            Message = "Recommendations retrieved successfully"
        });
    }
    [HttpGet("trending")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<CourseRecommendationListDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTrendingCourses([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var trending = await _recommendationService.GetTrendingCoursesAsync(pageNumber, pageSize);
        return Ok(new ApiResponse<CourseRecommendationListDto>
        {
            Success = true,
            Data = trending,
            Message = "Trending courses retrieved successfully"
        });
    }
    [HttpGet("similar")]
    [ProducesResponseType(typeof(ApiResponse<CourseRecommendationListDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetSimilarCourses([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var userId = GetUserId();
        if (userId == 0)
            return BadRequest(new ApiResponse<string> { Success = false, Message = "Unable to identify user" });
        var similar = await _recommendationService.GetSimilarCoursesAsync(userId, pageNumber, pageSize);
        return Ok(new ApiResponse<CourseRecommendationListDto>
        {
            Success = true,
            Data = similar,
            Message = "Similar courses retrieved successfully"
        });
    }
    [HttpPost("recommendations/{recommendationId}/mark-viewed")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkRecommendationViewed([FromRoute] int recommendationId)
    {
        await _recommendationService.MarkRecommendationViewedAsync(recommendationId);
        return Ok(new ApiResponse<string>
        {
            Success = true,
            Message = "Recommendation marked as viewed"
        });
    }
    [HttpPost("courses/{courseId}/track-interaction")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> TrackInteraction(
        [FromRoute] int courseId,
        [FromQuery] string interactionType = "view")
    {
        var userId = GetUserId();
        if (userId == 0)
            return BadRequest(new ApiResponse<string> { Success = false, Message = "Unable to identify user" });
        await _recommendationService.TrackInteractionAsync(userId, courseId, interactionType);
        return Ok(new ApiResponse<string>
        {
            Success = true,
            Message = $"Interaction '{interactionType}' tracked successfully"
        });
    }
    [HttpPost("regenerate")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegenerateRecommendations()
    {
        var userId = GetUserId();
        if (userId == 0)
            return BadRequest(new ApiResponse<string> { Success = false, Message = "Unable to identify user" });
        await _recommendationService.GenerateRecommendationsAsync(userId);
        return Ok(new ApiResponse<string>
        {
            Success = true,
            Message = "Recommendations regenerated successfully"
        });
    }
}