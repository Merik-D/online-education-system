namespace OnlineEducation.Api.Dtos.Courses;
public class RecommendedCourseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public int EnrollmentCount { get; set; }
    public double AverageRating { get; set; }
    public string Category { get; set; } = string.Empty;
    public double RecommendationScore { get; set; }
    public string RecommendationReason { get; set; } = string.Empty;
    public string InstructorName { get; set; } = string.Empty;
    public int RecommendationId { get; set; }
}
public class CourseRecommendationListDto
{
    public int TotalRecommendations { get; set; }
    public List<RecommendedCourseDto> Recommendations { get; set; } = new();
    public string FilterApplied { get; set; } = "all";
}