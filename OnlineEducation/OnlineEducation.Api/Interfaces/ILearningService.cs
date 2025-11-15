using Microsoft.AspNetCore.Mvc;
using OnlineEducation.Api.Dtos.Courses;
using OnlineEducation.Api.Dtos.Learning;

namespace OnlineEducation.Api.Interfaces;

public interface ILearningService
{
    Task EnrollInCourseAsync(int courseId, int userId);
    Task<IEnumerable<CourseDto>> GetMyCoursesAsync(int userId);
    Task<MyCourseDetailsDto?> GetCourseDetailsAsync(int courseId, int userId);
    Task<GradingResultDto> SubmitTestAsync(int testId, int userId, TestSubmissionDto submissionDto);
    Task<LessonDto?> GetLessonDetailsAsync(int lessonId, int userId);
}