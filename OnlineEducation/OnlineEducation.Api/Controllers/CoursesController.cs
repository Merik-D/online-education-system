using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineEducation.Api.Dtos.Courses;
using OnlineEducation.Api.Interfaces;
namespace OnlineEducation.Api.Controllers;
[Route("api/[controller]")]
[ApiController]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;
    public CoursesController(ICourseService courseService)
    {
        _courseService = courseService;
    }
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CourseDto>>> GetCourses()
    {
        var courses = await _courseService.GetCoursesAsync();
        return Ok(courses);
    }
    [HttpPost("search")]
    public async Task<ActionResult<CourseSearchResultDto>> SearchCourses([FromBody] CourseSearchDto searchDto)
    {
        var result = await _courseService.SearchCoursesAsync(searchDto);
        return Ok(result);
    }
    [HttpGet("{id}")]
    public async Task<ActionResult<CourseDto>> GetCourse(int id)
    {
        var course = await _courseService.GetCourseAsync(id);
        if (course == null)
        {
            return NotFound();
        }
        return Ok(course);
    }
    [HttpPost]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<ActionResult<CourseDto>> CreateCourse([FromBody] CreateCourseDto createCourseDto)
    {
        var courseDto = await _courseService.CreateCourseAsync(createCourseDto);
        return CreatedAtAction(nameof(GetCourse), new { id = courseDto.Id }, courseDto);
    }
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> UpdateCourse(int id, [FromBody] CreateCourseDto updateCourseDto)
    {
        var result = await _courseService.UpdateCourseAsync(id, updateCourseDto);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCourse(int id)
    {
        var result = await _courseService.DeleteCourseAsync(id);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }
    [HttpGet("search")]
    public async Task<ActionResult<CourseSearchResultDto>> SearchCoursesGet([FromQuery] CourseSearchDto searchDto)
    {
        var result = await _courseService.SearchCoursesAsync(searchDto);
        return Ok(result);
    }
    [HttpGet("categories/{categoryId:int}")]
    public async Task<ActionResult<IEnumerable<CourseDto>>> GetCoursesByCategory([FromRoute] int categoryId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _courseService.SearchCoursesAsync(new CourseSearchDto
        {
            CategoryId = categoryId,
            PageNumber = pageNumber,
            PageSize = pageSize
        });
        return Ok(result.Courses);
    }
}