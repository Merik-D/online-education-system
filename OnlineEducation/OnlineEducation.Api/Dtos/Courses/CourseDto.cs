namespace OnlineEducation.Api.Dtos.Courses;
public class CourseDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Level { get; set; }
    public int InstructorId { get; set; }
    public string? InstructorName { get; set; }
    public int CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public decimal? AverageRating { get; set; }
    public int ReviewCount { get; set; }
}