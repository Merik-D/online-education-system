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
    Task<FinancialReportDto?> GetInstructorFinancialReportAsync(int instructorId, DateTime? startDate, DateTime? endDate);
    Task<CourseRevenueDto?> GetCourseRevenueAsync(int courseId, DateTime? startDate, DateTime? endDate);
    Task<PlatformRevenueDto> GetPlatformRevenueAsync(DateTime? startDate, DateTime? endDate);
    Task<List<MonthlyRevenueDto>> GetMonthlyRevenueAsync(int monthsBack = 12);
    Task<PlatformRatingsStatisticsDto?> GetAllInstructorRatingsAsync();
    Task<InstructorRatingsDto?> GetInstructorRatingDetailsAsync(int instructorId);
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
            PendingRevenue = 0,
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
    public async Task<FinancialReportDto?> GetInstructorFinancialReportAsync(int instructorId, DateTime? startDate, DateTime? endDate)
    {
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
        var courses = _context.Courses
            .Include(c => c.Enrollments)
            .ToList();
        return Task.FromResult(GenerateMonthlyTrend(courses));
    }
    public async Task<PlatformRatingsStatisticsDto?> GetAllInstructorRatingsAsync()
    {
        try
        {
            var reviews = await _context.Reviews
                .Include(r => r.Course)
                    .ThenInclude(c => c.Instructor)
                .Include(r => r.Student)
                .AsNoTracking()
                .ToListAsync();
            if (!reviews.Any())
                return null;
            var averageRating = reviews.Average(r => r.Rating);
            var instructorGroups = reviews
                .GroupBy(r => r.Course.InstructorId)
                .Select(g => new
                {
                    InstructorId = g.Key,
                    InstructorName = g.First().Course.Instructor.FullName,
                    AverageRating = g.Average(r => r.Rating),
                    ReviewCount = g.Count()
                })
                .ToList();
            var topInstructors = instructorGroups
                .OrderByDescending(i => i.AverageRating)
                .ThenByDescending(i => i.ReviewCount)
                .Take(10)
                .Select(i => new TopRatedInstructorDto
                {
                    InstructorId = i.InstructorId,
                    Name = i.InstructorName,
                    AverageRating = Math.Round(i.AverageRating, 2),
                    ReviewCount = i.ReviewCount
                })
                .ToList();
            var lowestInstructors = instructorGroups
                .Where(i => i.ReviewCount >= 3)
                .OrderBy(i => i.AverageRating)
                .ThenByDescending(i => i.ReviewCount)
                .Take(10)
                .Select(i => new LowestRatedInstructorDto
                {
                    InstructorId = i.InstructorId,
                    Name = i.InstructorName,
                    AverageRating = Math.Round(i.AverageRating, 2),
                    ReviewCount = i.ReviewCount
                })
                .ToList();
            var totalCoursesInSystem = await _context.Courses.CountAsync();
            var totalInstructorsInSystem = await _context.Users
                .Where(u => u.CoursesAsInstructor.Any())
                .CountAsync();
            return new PlatformRatingsStatisticsDto
            {
                AveragePlatformRating = Math.Round(averageRating, 2),
                TotalReviews = reviews.Count,
                TotalInstructors = totalInstructorsInSystem,
                TotalCourses = totalCoursesInSystem,
                TopInstructors = topInstructors,
                LowestRatedInstructors = lowestInstructors
            };
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error calculating platform ratings: {ex.Message}");
            return null;
        }
    }
    public async Task<InstructorRatingsDto?> GetInstructorRatingDetailsAsync(int instructorId)
    {
        try
        {
            var instructor = await _context.Users
                .Include(u => u.CoursesAsInstructor)
                    .ThenInclude(c => c.Reviews)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == instructorId);
            if (instructor == null || !instructor.CoursesAsInstructor.Any())
                return null;
            var courses = instructor.CoursesAsInstructor;
            var allReviews = courses.SelectMany(c => c.Reviews).ToList();
            if (!allReviews.Any())
                return new InstructorRatingsDto
                {
                    InstructorId = instructorId,
                    InstructorName = instructor.FullName,
                    Email = instructor.Email,
                    AverageRating = 0,
                    TotalReviews = 0,
                    TotalCourses = courses.Count,
                    TotalStudents = 0
                };
            var averageRating = allReviews.Average(r => r.Rating);
            var totalStudents = await _context.Enrollments
                .Where(e => courses.Select(c => c.Id).Contains(e.CourseId))
                .Select(e => e.StudentId)
                .Distinct()
                .CountAsync();
            var courseRatings = courses
                .Select(c => new CourseRatingBreakdownDto
                {
                    CourseId = c.Id,
                    CourseName = c.Title,
                    AverageRating = c.Reviews.Any() ? Math.Round(c.Reviews.Average(r => r.Rating), 2) : 0,
                    ReviewCount = c.Reviews.Count,
                    EnrollmentCount = c.Enrollments?.Count ?? 0
                })
                .OrderByDescending(cr => cr.AverageRating)
                .ToList();
            return new InstructorRatingsDto
            {
                InstructorId = instructorId,
                InstructorName = instructor.FullName,
                Email = instructor.Email,
                AverageRating = Math.Round(averageRating, 2),
                TotalReviews = allReviews.Count,
                TotalCourses = courses.Count,
                TotalStudents = totalStudents,
                CourseRatings = courseRatings
            };
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching instructor rating details: {ex.Message}");
            return null;
        }
    }
}