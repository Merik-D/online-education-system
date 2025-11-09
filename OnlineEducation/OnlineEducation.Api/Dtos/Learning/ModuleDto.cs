namespace OnlineEducation.Api.Dtos.Learning;

public class ModuleDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public int Order { get; set; }
    public List<LessonDto> Lessons { get; set; } = new();

    // maybe add TestDto later
}