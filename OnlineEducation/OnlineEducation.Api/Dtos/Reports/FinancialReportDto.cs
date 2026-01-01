namespace OnlineEducation.Api.Dtos.Reports;
public class FinancialReportDto
{
    public int InstructorId { get; set; }
    public string InstructorName { get; set; } = string.Empty;
    public decimal TotalRevenue { get; set; }
    public decimal PendingRevenue { get; set; }
    public int TotalEnrollments { get; set; }
    public decimal AveragePerCourse { get; set; }
    public List<CourseRevenueDto> CourseBreakdown { get; set; } = new();
    public List<MonthlyRevenueDto> MonthlyTrend { get; set; } = new();
}
public class CourseRevenueDto
{
    public int CourseId { get; set; }
    public string CourseName { get; set; } = string.Empty;
    public int EnrollmentCount { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal RevenuePerStudent { get; set; }
}
public class MonthlyRevenueDto
{
    public string Month { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int Enrollments { get; set; }
}
public class PlatformRevenueDto
{
    public decimal TotalRevenue { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}