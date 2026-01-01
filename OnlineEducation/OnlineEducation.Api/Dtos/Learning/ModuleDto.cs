namespace OnlineEducation.Api.Dtos.Learning;
public class ModuleDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public int Order { get; set; }
    public List<LessonDto> Lessons { get; set; } = new();
    public int CompletedLessonsCount { get; set; }
    public int TotalLessonsCount { get; set; }
    public TestDto? Test { get; set; }
}
public class TestDto
{
    public int Id { get; set; }
    public string Title { get; set; }
}