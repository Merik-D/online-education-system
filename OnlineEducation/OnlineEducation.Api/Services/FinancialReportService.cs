using OnlineEducation.Api.Data;
using OnlineEducation.Api.Dtos.Reports;
using OnlineEducation.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace OnlineEducation.Api.Services;

public interface IFinancialReportService
{
    Task<FinancialReportDto> GetInstructorRevenueAsync(int instructorId);
    Task<List<FinancialReportDto>> GetAllInstructorsRevenueAsync();
    Task<decimal> CalculatePlatformRevenueAsync(DateTime? startDate = null, DateTime? endDate = null);

    // Methods used by ReportsController
    Task<FinancialReportDto?> GetInstructorFinancialReportAsync(int instructorId, DateTime? startDate, DateTime? endDate);
    Task<CourseRevenueDto?> GetCourseRevenueAsync(int courseId, DateTime? startDate, DateTime? endDate);
    Task<PlatformRevenueDto> GetPlatformRevenueAsync(DateTime? startDate, DateTime? endDate);
    Task<List<MonthlyRevenueDto>> GetMonthlyRevenueAsync(int monthsBack = 12);
}

public class FinancialReportService : IFinancialReportService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<FinancialReportService> _logger;
    private const decimal COURSE_PRICE = 29.99m;

    public FinancialReportService(ApplicationDbContext context, ILogger<FinancialReportService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<FinancialReportDto> GetInstructorRevenueAsync(int instructorId)
    {
        var instructor = await _context.Users.FindAsync(instructorId);
        if (instructor == null) return new FinancialReportDto();

        var courses = await _context.Courses
            .Where(c => c.InstructorId == instructorId)
            .Include(c => c.Enrollments)
            .ToListAsync();

        var totalEnrollments = courses.Sum(c => c.Enrollments?.Count ?? 0);
        var totalRevenue = totalEnrollments * COURSE_PRICE;

        var courseBreakdown = courses.Select(c => new CourseRevenueDto
        {
            CourseId = c.Id,
            CourseName = c.Title,
            EnrollmentCount = c.Enrollments?.Count ?? 0,
            TotalRevenue = (c.Enrollments?.Count ?? 0) * COURSE_PRICE,
            RevenuePerStudent = COURSE_PRICE
        }).ToList();

        var monthlyData = GenerateMonthlyTrend(courses);

        return new FinancialReportDto
        {
            InstructorId = instructorId,
            InstructorName = instructor.FullName,
            TotalRevenue = totalRevenue,
            PendingRevenue = 0, // Can be customized based on payment status
            TotalEnrollments = totalEnrollments,
            AveragePerCourse = courses.Count > 0 ? totalRevenue / courses.Count : 0,
            CourseBreakdown = courseBreakdown,
            MonthlyTrend = monthlyData
        };
    }

    public async Task<List<FinancialReportDto>> GetAllInstructorsRevenueAsync()
    {
        var instructorIds = await _context.Courses
            .Select(c => c.InstructorId)
            .Distinct()
            .ToListAsync();

        var instructors = await _context.Users
            .Where(u => instructorIds.Contains(u.Id))
            .ToListAsync();

        var reports = new List<FinancialReportDto>();
        foreach (var instructor in instructors)
        {
            reports.Add(await GetInstructorRevenueAsync(instructor.Id));
        }

        return reports.OrderByDescending(r => r.TotalRevenue).ToList();
    }

    public async Task<decimal> CalculatePlatformRevenueAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        startDate ??= DateTime.UtcNow.AddMonths(-12);
        endDate ??= DateTime.UtcNow;

        var enrollments = await _context.Enrollments
            .Where(e => e.EnrollmentDate >= startDate && e.EnrollmentDate <= endDate)
            .CountAsync();

        return enrollments * COURSE_PRICE;
    }

    private List<MonthlyRevenueDto> GenerateMonthlyTrend(List<Course> courses)
    {
        var monthlyData = new Dictionary<string, (decimal revenue, int enrollments)>();

        for (int i = 11; i >= 0; i--)
        {
            var date = DateTime.UtcNow.AddMonths(-i);
            var monthKey = date.ToString("yyyy-MM");
            monthlyData[monthKey] = (0, 0);
        }

        foreach (var course in courses)
        {
            var enrollments = course.Enrollments ?? new List<Enrollment>();
            foreach (var enrollment in enrollments)
            {
                var monthKey = enrollment.EnrollmentDate.ToString("yyyy-MM");
                if (monthlyData.ContainsKey(monthKey))
                {
                    var (rev, count) = monthlyData[monthKey];
                    monthlyData[monthKey] = (rev + COURSE_PRICE, count + 1);
                }
            }
        }

        return monthlyData
            .Select(kvp => new MonthlyRevenueDto
            {
                Month = kvp.Key,
                Revenue = kvp.Value.revenue,
                Enrollments = kvp.Value.enrollments
            })
            .ToList();
    }

    // ReportsController-compatible methods
    public async Task<FinancialReportDto?> GetInstructorFinancialReportAsync(int instructorId, DateTime? startDate, DateTime? endDate)
    {
        // Currently ignoring date range at instructor aggregation level; can be enhanced.
        return await GetInstructorRevenueAsync(instructorId);
    }

    public async Task<CourseRevenueDto?> GetCourseRevenueAsync(int courseId, DateTime? startDate, DateTime? endDate)
    {
        startDate ??= DateTime.UtcNow.AddMonths(-12);
        endDate ??= DateTime.UtcNow;

        var course = await _context.Courses
            .Include(c => c.Enrollments)
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (course == null) return null;

        var enrollments = course.Enrollments?
            .Where(e => e.EnrollmentDate >= startDate && e.EnrollmentDate <= endDate)
            .ToList() ?? new List<Enrollment>();

        return new CourseRevenueDto
        {
            CourseId = course.Id,
            CourseName = course.Title,
            EnrollmentCount = enrollments.Count,
            TotalRevenue = enrollments.Count * COURSE_PRICE,
            RevenuePerStudent = COURSE_PRICE
        };
    }

    public async Task<PlatformRevenueDto> GetPlatformRevenueAsync(DateTime? startDate, DateTime? endDate)
    {
        var total = await CalculatePlatformRevenueAsync(startDate, endDate);
        return new PlatformRevenueDto
        {
            TotalRevenue = total,
            StartDate = startDate ?? DateTime.UtcNow.AddMonths(-12),
            EndDate = endDate ?? DateTime.UtcNow
        };
    }

    public Task<List<MonthlyRevenueDto>> GetMonthlyRevenueAsync(int monthsBack = 12)
    {
        // Aggregate across all courses
        var courses = _context.Courses
            .Include(c => c.Enrollments)
            .ToList();

        return Task.FromResult(GenerateMonthlyTrend(courses));
    }
}
