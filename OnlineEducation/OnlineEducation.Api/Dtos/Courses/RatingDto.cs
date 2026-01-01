namespace OnlineEducation.Api.Dtos.Courses;
public class RatingDto
{
    public int Id { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsVerified { get; set; }
}
public class InstructorRatingDto
{
    public int InstructorId { get; set; }
    public string InstructorName { get; set; } = string.Empty;
    public double AverageRating { get; set; }
    public int TotalRatings { get; set; }
    public Dictionary<int, int> RatingDistribution { get; set; } = new();
    public List<RatingDto> RecentReviews { get; set; } = new();
}
public class CreateRatingDto
{
    public int CourseId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
}