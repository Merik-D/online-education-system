using Microsoft.AspNetCore.Mvc;
using OnlineEducation.Api.Dtos.Courses;
namespace OnlineEducation.Api.Interfaces;
public interface ICourseService
{
    Task<IEnumerable<CourseDto>> GetCoursesAsync();
    Task<CourseDto?> GetCourseAsync(int id);
    Task<CourseDto> CreateCourseAsync(CreateCourseDto createCourseDto);
    Task<bool> UpdateCourseAsync(int id, CreateCourseDto updateCourseDto);
    Task<bool> DeleteCourseAsync(int id);
    Task<CourseSearchResultDto> SearchCoursesAsync(CourseSearchDto searchDto);
}