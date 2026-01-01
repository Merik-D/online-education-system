namespace OnlineEducation.Api.Dtos.Students;
public class CourseProgressDto
{
    public int CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public double Progress { get; set; }
}