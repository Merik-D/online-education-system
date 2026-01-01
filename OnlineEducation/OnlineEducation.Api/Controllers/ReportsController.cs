using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineEducation.Api.Dtos.Reports;
using OnlineEducation.Api.Extensions;
using OnlineEducation.Api.Services;
using OnlineEducation.Api.Interfaces;
namespace OnlineEducation.Api.Controllers;
[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IFinancialReportService _financialReportService;
    private readonly ILogger<ReportsController> _logger;
    private readonly IRecommendationService _recommendationService;
    public ReportsController(IFinancialReportService financialReportService, ILogger<ReportsController> logger, IRecommendationService recommendationService)
    {
        _financialReportService = financialReportService;
        _logger = logger;
        _recommendationService = recommendationService;
    }
    [HttpGet("financial/instructor/{instructorId}")]
    [Authorize(Roles = "Instructor, Admin")]
    public async Task<ActionResult<FinancialReportDto>> GetInstructorFinancialReport(int instructorId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        try
        {
            var currentUserId = User.GetUserId();
            if (!User.IsInRole("Admin") && currentUserId != instructorId)
                return Forbid();
            var report = await _financialReportService.GetInstructorFinancialReportAsync(instructorId, startDate, endDate);
            if (report == null)
                return NotFound(new { message = "No financial data available" });
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching instructor financial report: {ex.Message}");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
        }
    }
    [HttpGet("financial/course/{courseId}")]
    [Authorize(Roles = "Instructor, Admin")]
    public async Task<ActionResult<CourseRevenueDto>> GetCourseRevenue(int courseId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        try
        {
            var revenue = await _financialReportService.GetCourseRevenueAsync(courseId, startDate, endDate);
            if (revenue == null)
                return NotFound(new { message = "No revenue data found for this course" });
            return Ok(revenue);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching course revenue: {ex.Message}");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
        }
    }
    [HttpGet("financial/platform")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PlatformRevenueDto>> GetPlatformRevenue([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        try
        {
            var revenue = await _financialReportService.GetPlatformRevenueAsync(startDate, endDate);
            return Ok(revenue);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching platform revenue: {ex.Message}");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
        }
    }
    [HttpGet("financial/monthly")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<MonthlyRevenueDto>>> GetMonthlyRevenue([FromQuery] int monthsBack = 12)
    {
        try
        {
            var monthlyData = await _financialReportService.GetMonthlyRevenueAsync(monthsBack);
            return Ok(monthlyData);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching monthly revenue: {ex.Message}");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
        }
    }
    [HttpGet("courses-popularity")]
    [Authorize]
    public async Task<IActionResult> GetCoursesPopularity([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var trending = await _recommendationService.GetTrendingCoursesAsync(pageNumber, pageSize);
            return Ok(trending);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching courses popularity: {ex.Message}");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
        }
    }
    [HttpGet("instructors-rating")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PlatformRatingsStatisticsDto>> GetInstructorsRatings()
    {
        try
        {
            var allReviews = await _financialReportService.GetAllInstructorRatingsAsync();
            if (allReviews == null || allReviews.AveragePlatformRating == 0)
                return Ok(new PlatformRatingsStatisticsDto
                {
                    AveragePlatformRating = 0,
                    TotalReviews = 0,
                    TotalInstructors = 0,
                    TotalCourses = 0
                });
            return Ok(allReviews);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching instructor ratings: {ex.Message}");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
        }
    }
    [HttpGet("instructors-rating/{instructorId}")]
    [Authorize(Roles = "Admin, Instructor")]
    public async Task<ActionResult<InstructorRatingsDto>> GetInstructorRatingDetails(int instructorId)
    {
        try
        {
            var currentUserId = User.GetUserId();
            if (!User.IsInRole("Admin") && currentUserId != instructorId)
                return Forbid();
            var ratings = await _financialReportService.GetInstructorRatingDetailsAsync(instructorId);
            if (ratings == null)
                return NotFound(new { message = "No rating data found for this instructor" });
            return Ok(ratings);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching instructor rating details: {ex.Message}");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
        }
    }
}