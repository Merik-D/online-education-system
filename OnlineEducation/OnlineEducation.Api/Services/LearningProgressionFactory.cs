using OnlineEducation.Api.Data;
using OnlineEducation.Api.Enums;
using OnlineEducation.Api.Interfaces;
using OnlineEducation.Api.Services.Learning;
namespace OnlineEducation.Api.Services;
public class LearningProgressionFactory : ILearningProgressionFactory
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<VideoLessonProgression> _videoLogger;
    private readonly ILogger<TextLessonProgression> _textLogger;
    public LearningProgressionFactory(
        ApplicationDbContext context,
        ILogger<VideoLessonProgression> videoLogger,
        ILogger<TextLessonProgression> textLogger)
    {
        _context = context;
        _videoLogger = videoLogger;
        _textLogger = textLogger;
    }
    public LearningProgressionTemplate CreateProgression(LessonType lessonType) => lessonType switch
    {
        LessonType.Video => new VideoLessonProgression(_context, _videoLogger),
        LessonType.Text => new TextLessonProgression(_context, _textLogger),
        _ => throw new ArgumentException($"Unsupported lesson type: {lessonType}")
    };
}