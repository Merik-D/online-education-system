using OnlineEducation.Api.Enums;
using OnlineEducation.Api.Services.Learning;

namespace OnlineEducation.Api.Interfaces;

/// <summary>
/// Factory interface for creating appropriate learning progression templates
/// Combines Factory Method with Template Method patterns
/// </summary>
public interface ILearningProgressionFactory
{
    LearningProgressionTemplate CreateProgression(LessonType lessonType);
}
