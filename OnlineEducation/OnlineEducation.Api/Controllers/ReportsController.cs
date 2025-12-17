using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineEducation.Api.Dtos.Reports;
using OnlineEducation.Api.Extensions;
using OnlineEducation.Api.Services;

namespace OnlineEducation.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IFinancialReportService _financialReportService;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(IFinancialReportService financialReportService, ILogger<ReportsController> logger)
    {
        _financialReportService = financialReportService;
        _logger = logger;
    }

    [HttpGet("financial/instructor/{instructorId}")]
    [Authorize(Roles = "Instructor, Admin")]
    public async Task<ActionResult<FinancialReportDto>> GetInstructorFinancialReport(int instructorId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        try
        {
            var currentUserId = User.GetUserId();
            
            // Only instructors can view their own reports, admins can view all
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
}
