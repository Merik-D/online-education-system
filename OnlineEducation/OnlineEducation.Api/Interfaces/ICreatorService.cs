using OnlineEducation.Api.Dtos.Creator;

namespace OnlineEducation.Api.Interfaces;

public interface ICreatorService
{
    Task<(bool, string?, object?)> CreateModuleAsync(int courseId, ModuleCreateDto moduleDto, int instructorId);
    Task<(bool, string?, object?)> CreateLessonAsync(int moduleId, LessonCreateDto lessonDto, int instructorId);
    Task<(bool, string?, object?)> CreateTestAsync(int moduleId, TestCreateDto testDto, int instructorId);
    Task<(bool, string?, object?)> CreateQuestionAsync(int testId, QuestionCreateDto questionDto, int instructorId);

    Task<(bool, string?, object?)> UpdateCourseAsync(int courseId, CourseUpdateDto dto, int instructorId);
    Task<(bool, string?)> DeleteCourseAsync(int courseId, int instructorId);

    Task<(bool, string?, object?)> UpdateModuleAsync(int moduleId, ModuleCreateDto dto, int instructorId);
    Task<(bool, string?)> DeleteModuleAsync(int moduleId, int instructorId);

    Task<(bool, string?, object?)> UpdateLessonAsync(int lessonId, LessonCreateDto dto, int instructorId);
    Task<(bool, string?)> DeleteLessonAsync(int lessonId, int instructorId);

    Task<(bool, string?, object?)> UpdateTestAsync(int testId, TestCreateDto dto, int instructorId);
    Task<(bool, string?)> DeleteTestAsync(int testId, int instructorId);
}