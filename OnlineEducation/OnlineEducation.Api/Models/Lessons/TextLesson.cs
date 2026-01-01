using OnlineEducation.Api.Enums;
namespace OnlineEducation.Api.Models.Lessons;
public class TextLesson : Lesson
{
    public TextLesson()
    {
        Type = LessonType.Text;
    }
    public string? TextContent { get; set; }
}