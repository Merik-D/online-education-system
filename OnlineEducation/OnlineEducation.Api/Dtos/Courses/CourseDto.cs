namespace OnlineEducation.Api.Dtos.Courses;

public class CourseDto
{
    public int Id { get; set; }

    public string Title { get; set; }

    public string Description { get; set; }

    public string Level { get; set; }

    public int InstructorId { get; set; }

    public int CategoryId { get; set; }
}