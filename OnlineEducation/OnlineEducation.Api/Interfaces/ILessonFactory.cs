using OnlineEducation.Api.Enums;
using OnlineEducation.Api.Models.Lessons;

namespace OnlineEducation.Api.Interfaces;

/// <summary>
/// Factory Method Pattern: Defines interface for creating Lesson objects
/// </summary>
public interface ILessonFactory
{
    /// <summary>
    /// Factory method to create appropriate lesson type
    /// </summary>
    Lesson CreateLesson(LessonType type, string title, int order, int moduleId);
}

/// <summary>
/// Concrete Factory: Creates specific lesson types based on LessonType enum
/// </summary>
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
                VideoUrl = string.Empty // Will be set by service
            },
            LessonType.Text => new TextLesson
            {
                Title = title,
                Order = order,
                ModuleId = moduleId,
                TextContent = string.Empty // Will be set by service
            },
            _ => throw new ArgumentException($"Unsupported lesson type: {type}")
        };
    }
}
