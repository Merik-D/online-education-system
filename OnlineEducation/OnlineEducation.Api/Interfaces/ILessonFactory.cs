using OnlineEducation.Api.Enums;
using OnlineEducation.Api.Models.Lessons;
namespace OnlineEducation.Api.Interfaces;
public interface ILessonFactory
{
    Lesson CreateLesson(LessonType type, string title, int order, int moduleId);
}
public class LessonFactory : ILessonFactory
{
    public Lesson CreateLesson(LessonType type, string title, int order, int moduleId)
    {
        return type switch
        {
            LessonType.Video => new VideoLesson
            {
                Title = title,
                Order = order,
                ModuleId = moduleId,
                VideoUrl = string.Empty
            },
            LessonType.Text => new TextLesson
            {
                Title = title,
                Order = order,
                ModuleId = moduleId,
                TextContent = string.Empty
            },
            _ => throw new ArgumentException($"Unsupported lesson type: {type}")
        };
    }
}