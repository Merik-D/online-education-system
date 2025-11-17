using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineEducation.Api.Data;
using OnlineEducation.Api.Dtos.Creator;
using OnlineEducation.Api.Extensions;
using OnlineEducation.Api.Models;
using OnlineEducation.Api.Models.Lessons;

namespace OnlineEducation.Api.Controllers;

[Route("api/creator")]
[ApiController]
[Authorize(Roles = "Instructor")]
public class CreatorController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CreatorController(ApplicationDbContext context)
    {
        _context = context;
    }

    private async Task<(bool, IActionResult?)> CheckOwnership(int courseId)
    {
        var userId = User.GetUserId();
        var userRoles = User.FindAll(c => c.Type.EndsWith("claims/role")).Select(c => c.Value).ToList();

        if (userRoles.Contains("Admin"))
        {
            return (true, null);
        }

        var isOwner = await _context.Courses
            .AnyAsync(c => c.Id == courseId && c.InstructorId == userId);

        if (!isOwner)
        {
            return (false, Forbid("You do not own this course."));
        }

        return (true, null);
    }

    [HttpPost("courses/{courseId}/modules")]
    public async Task<IActionResult> CreateModule(int courseId, [FromBody] ModuleCreateDto moduleDto)
    {
        var (isOwner, errorResult) = await CheckOwnership(courseId);
        if (!isOwner) return errorResult;

        var module = new Module
        {
            Title = moduleDto.Title,
            Order = moduleDto.Order,
            CourseId = courseId
        };

        await _context.Modules.AddAsync(module);
        await _context.SaveChangesAsync();

        return Ok(module);
    }

    [HttpPost("modules/{moduleId}/lessons")]
    public async Task<IActionResult> CreateLesson(int moduleId, [FromBody] LessonCreateDto lessonDto)
    {
        var module = await _context.Modules.FindAsync(moduleId);
        if (module == null) return NotFound("Module not found.");

        var (isOwner, errorResult) = await CheckOwnership(module.CourseId);
        if (!isOwner) return errorResult;

        Lesson lesson;
        if (lessonDto.Type == OnlineEducation.Api.Enums.LessonType.Video)
        {
            lesson = new VideoLesson { VideoUrl = lessonDto.VideoUrl };
        }
        else
        {
            lesson = new TextLesson { TextContent = lessonDto.TextContent };
        }

        lesson.Title = lessonDto.Title;
        lesson.Order = lessonDto.Order;
        lesson.ModuleId = moduleId;

        await _context.Lessons.AddAsync(lesson);
        await _context.SaveChangesAsync();
        return Ok(lesson);
    }

    [HttpPost("modules/{moduleId}/test")]
    public async Task<IActionResult> CreateTest(int moduleId, [FromBody] TestCreateDto testDto)
    {
        var module = await _context.Modules.FindAsync(moduleId);
        if (module == null) return NotFound("Module not found.");

        var (isOwner, errorResult) = await CheckOwnership(module.CourseId);
        if (!isOwner) return errorResult;

        var test = new Test
        {
            Title = testDto.Title,
            StrategyType = testDto.StrategyType,
            ModuleId = moduleId
        };

        await _context.Tests.AddAsync(test);
        await _context.SaveChangesAsync();
        return Ok(test);
    }

    [HttpPost("tests/{testId}/questions")]
    public async Task<IActionResult> CreateQuestion(int testId, [FromBody] QuestionCreateDto questionDto)
    {
        var test = await _context.Tests.Include(t => t.Module).FirstOrDefaultAsync(t => t.Id == testId);
        if (test == null) return NotFound("Test not found.");

        var (isOwner, errorResult) = await CheckOwnership(test.Module.CourseId);
        if (!isOwner) return errorResult;

        var question = new Question
        {
            Text = questionDto.Text,
            Type = questionDto.Type,
            Order = questionDto.Order,
            TestId = testId
        };

        foreach (var optDto in questionDto.Options)
        {
            question.Options.Add(new Option
            {
                Text = optDto.Text,
                IsCorrect = optDto.IsCorrect
            });
        }

        await _context.Questions.AddAsync(question);
        await _context.SaveChangesAsync();
        return Ok(question);
    }
}