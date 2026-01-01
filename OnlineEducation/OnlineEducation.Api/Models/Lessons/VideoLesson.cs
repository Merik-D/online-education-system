using OnlineEducation.Api.Enums;
namespace OnlineEducation.Api.Models.Lessons;
public class VideoLesson : Lesson
{
    public VideoLesson()
    {
        Type = LessonType.Video;
    }
    public string? VideoUrl { get; set; }
}