using OnlineEducation.Api.Enums;
using OnlineEducation.Api.Services.Learning;
namespace OnlineEducation.Api.Interfaces;
public interface ILearningProgressionFactory
{
    LearningProgressionTemplate CreateProgression(LessonType lessonType);
}