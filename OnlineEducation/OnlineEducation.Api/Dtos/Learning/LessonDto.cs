using OnlineEducation.Api.Enums;

namespace OnlineEducation.Api.Dtos.Learning;

public class LessonDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public LessonType Type { get; set; }
    public int Order { get; set; }
    public string? VideoUrl { get; set; }
    public string? TextContent { get; set; }
}