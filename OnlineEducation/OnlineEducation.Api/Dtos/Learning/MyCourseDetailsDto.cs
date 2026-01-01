namespace OnlineEducation.Api.Dtos.Learning;
public class MyCourseDetailsDto
{
    public int CourseId { get; set; }
    public string Title { get; set; }
    public double Progress { get; set; }
    public int CompletedLessonsCount { get; set; }
    public int TotalLessonsCount { get; set; }
    public List<ModuleDto> Modules { get; set; } = new();
}