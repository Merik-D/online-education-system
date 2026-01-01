using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineEducation.Api.Dtos.Creator;
using OnlineEducation.Api.Extensions;
using OnlineEducation.Api.Interfaces;
namespace OnlineEducation.Api.Controllers;
[Route("api/creator")]
[ApiController]
[Authorize(Roles = "Instructor")]
public class CreatorController : ControllerBase
{
    private readonly ICreatorService _creatorService;
    public CreatorController(ICreatorService creatorService)
    {
        _creatorService = creatorService;
    }
    [HttpGet("courses/{courseId}/structure")]
    public async Task<IActionResult> GetCourseStructure(int courseId)
    {
        var structure = await _creatorService.GetCourseStructureAsync(courseId, User.GetUserId());
        if (structure == null)
        {
            return Forbid("You do not own this course.");
        }
        return Ok(structure);
    }
    [HttpPost("courses")]
    public async Task<IActionResult> CreateCourse([FromBody] CourseCreateDto dto)
    {
        var (success, error, result) = await _creatorService.CreateCourseAsync(dto, User.GetUserId());
        if (!success) return BadRequest(new { message = error });
        return Ok(result);
    }
    [HttpGet("my-courses")]
    public async Task<IActionResult> GetMyCourses()
    {
        var courses = await _creatorService.GetMyCoursesAsync(User.GetUserId());
        return Ok(courses);
    }
    [HttpPost("courses/{courseId}/modules")]
    public async Task<IActionResult> CreateModule(int courseId, [FromBody] ModuleCreateDto moduleDto)
    {
        var (success, error, result) = await _creatorService.CreateModuleAsync(courseId, moduleDto, User.GetUserId());
        if (!success && error == "You do not own this course.") return Forbid(error);
        if (!success) return BadRequest(new { message = error });
        return Ok(result);
    }
    [HttpPost("modules/{moduleId}/lessons")]
    public async Task<IActionResult> CreateLesson(int moduleId, [FromBody] LessonCreateDto lessonDto)
    {
        var (success, error, result) = await _creatorService.CreateLessonAsync(moduleId, lessonDto, User.GetUserId());
        if (!success && error == "You do not own this course.") return Forbid(error);
        if (!success) return BadRequest(new { message = error });
        return Ok(result);
    }
    [HttpPost("modules/{moduleId}/test")]
    public async Task<IActionResult> CreateTest(int moduleId, [FromBody] TestCreateDto testDto)
    {
        var (success, error, result) = await _creatorService.CreateTestAsync(moduleId, testDto, User.GetUserId());
        if (!success && error == "You do not own this course.") return Forbid(error);
        if (!success) return BadRequest(new { message = error });
        return Ok(result);
    }
    [HttpPost("tests/{testId}/questions")]
    public async Task<IActionResult> CreateQuestion(int testId, [FromBody] QuestionCreateDto questionDto)
    {
        var (success, error, result) = await _creatorService.CreateQuestionAsync(testId, questionDto, User.GetUserId());
        if (!success && error == "You do not own this course.") return Forbid(error);
        if (!success) return BadRequest(new { message = error });
        return Ok(result);
    }
    [HttpPut("courses/{courseId}")]
    public async Task<IActionResult> UpdateCourse(int courseId, [FromBody] CourseUpdateDto dto)
    {
        var (success, error, result) = await _creatorService.UpdateCourseAsync(courseId, dto, User.GetUserId());
        if (!success && error == "You do not own this course.") return Forbid(error);
        if (!success) return NotFound(new { message = error });
        return Ok(result);
    }
    [HttpPut("modules/{moduleId}")]
    public async Task<IActionResult> UpdateModule(int moduleId, [FromBody] ModuleCreateDto dto)
    {
        var (success, error, result) = await _creatorService.UpdateModuleAsync(moduleId, dto, User.GetUserId());
        if (!success && error == "You do not own this course.") return Forbid(error);
        if (!success) return NotFound(new { message = error });
        return Ok(result);
    }
    [HttpPut("lessons/{lessonId}")]
    public async Task<IActionResult> UpdateLesson(int lessonId, [FromBody] LessonCreateDto dto)
    {
        var (success, error, result) = await _creatorService.UpdateLessonAsync(lessonId, dto, User.GetUserId());
        if (!success && error == "You do not own this course.") return Forbid(error);
        if (!success) return BadRequest(new { message = error });
        return Ok(result);
    }
    [HttpPut("tests/{testId}")]
    public async Task<IActionResult> UpdateTest(int testId, [FromBody] TestCreateDto dto)
    {
        var (success, error, result) = await _creatorService.UpdateTestAsync(testId, dto, User.GetUserId());
        if (!success && error == "You do not own this course.") return Forbid(error);
        if (!success) return NotFound(new { message = error });
        return Ok(result);
    }
    [HttpDelete("courses/{courseId}")]
    public async Task<IActionResult> DeleteCourse(int courseId)
    {
        var (success, error) = await _creatorService.DeleteCourseAsync(courseId, User.GetUserId());
        if (!success && error == "You do not own this course.") return Forbid(error);
        if (!success) return NotFound(new { message = error });
        return NoContent();
    }
    [HttpDelete("modules/{moduleId}")]
    public async Task<IActionResult> DeleteModule(int moduleId)
    {
        var (success, error) = await _creatorService.DeleteModuleAsync(moduleId, User.GetUserId());
        if (!success && error == "You do not own this course.") return Forbid(error);
        if (!success) return NotFound(new { message = error });
        return NoContent();
    }
    [HttpDelete("lessons/{lessonId}")]
    public async Task<IActionResult> DeleteLesson(int lessonId)
    {
        var (success, error) = await _creatorService.DeleteLessonAsync(lessonId, User.GetUserId());
        if (!success && error == "You do not own this course.") return Forbid(error);
        if (!success) return NotFound(new { message = error });
        return NoContent();
    }
    [HttpDelete("tests/{testId}")]
    public async Task<IActionResult> DeleteTest(int testId)
    {
        var (success, error) = await _creatorService.DeleteTestAsync(testId, User.GetUserId());
        if (!success && error == "You do not own this course.") return Forbid(error);
        if (!success) return NotFound(new { message = error });
        return NoContent();
    }
}