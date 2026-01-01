namespace OnlineEducation.Api.Dtos.Reports;
public class InstructorRatingsDto
{
    public int InstructorId { get; set; }
    public string InstructorName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
    public int TotalCourses { get; set; }
    public int TotalStudents { get; set; }
    public List<CourseRatingBreakdownDto> CourseRatings { get; set; } = new();
}
public class CourseRatingBreakdownDto
{
    public int CourseId { get; set; }
    public string CourseName { get; set; } = string.Empty;
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public int EnrollmentCount { get; set; }
}
public class PlatformRatingsStatisticsDto
{
    public double AveragePlatformRating { get; set; }
    public int TotalReviews { get; set; }
    public int TotalInstructors { get; set; }
    public int TotalCourses { get; set; }
    public List<TopRatedInstructorDto> TopInstructors { get; set; } = new();
    public List<LowestRatedInstructorDto> LowestRatedInstructors { get; set; } = new();
}
public class TopRatedInstructorDto
{
    public int InstructorId { get; set; }
    public string Name { get; set; } = string.Empty;
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
}
public class LowestRatedInstructorDto
{
    public int InstructorId { get; set; }
    public string Name { get; set; } = string.Empty;
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
}