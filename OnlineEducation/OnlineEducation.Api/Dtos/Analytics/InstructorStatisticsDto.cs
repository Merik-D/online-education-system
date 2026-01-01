namespace OnlineEducation.Api.Dtos.Analytics;
public class InstructorStatisticsDto
{
    public int InstructorId { get; set; }
    public int TotalCourses { get; set; }
    public int TotalStudents { get; set; }
    public double AverageCourseRating { get; set; }
}