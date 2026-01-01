using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineEducation.Api.Data;
using OnlineEducation.Api.Dtos.Courses;
using OnlineEducation.Api.Dtos.Creator;
using OnlineEducation.Api.Dtos.Learning;
using OnlineEducation.Api.Interfaces;
using OnlineEducation.Api.Models;
using OnlineEducation.Api.Models.Lessons;
namespace OnlineEducation.Api.Services;
public class CreatorService : ICreatorService
{
    private readonly ApplicationDbContext _context;
    private readonly ILessonFactory _lessonFactory;
    public CreatorService(ApplicationDbContext context, ILessonFactory lessonFactory)
    {
        _context = context;
        _lessonFactory = lessonFactory;
    }
    private async Task<bool> IsCourseOwner(int courseId, int instructorId)
    {
        return await _context.Courses
            .AnyAsync(c => c.Id == courseId && c.InstructorId == instructorId);
    }
    public async Task<(bool, string?, object?)> CreateModuleAsync(int courseId, ModuleCreateDto moduleDto, int instructorId)
    {
        if (!await IsCourseOwner(courseId, instructorId))
        {
            return (false, "You do not own this course.", null);
        }
        var module = new Module
        {
            Title = moduleDto.Title,
            Order = moduleDto.Order,
            CourseId = courseId
        };
        await _context.Modules.AddAsync(module);
        await _context.SaveChangesAsync();
        return (true, null, module);
    }
    public async Task<(bool, string?, object?)> CreateLessonAsync(int moduleId, LessonCreateDto lessonDto, int instructorId)
    {
        var module = await _context.Modules.FindAsync(moduleId);
        if (module == null) return (false, "Module not found.", null);
        if (!await IsCourseOwner(module.CourseId, instructorId))
        {
            return (false, "You do not own this course.", null);
        }
        var lesson = _lessonFactory.CreateLesson(
            lessonDto.Type,
            lessonDto.Title,
            lessonDto.Order,
            moduleId
        );
        if (lesson is VideoLesson videoLesson)
        {
            videoLesson.VideoUrl = lessonDto.VideoUrl ?? string.Empty;
        }
        else if (lesson is TextLesson textLesson)
        {
            textLesson.TextContent = lessonDto.TextContent ?? string.Empty;
        }
        await _context.Lessons.AddAsync(lesson);
        await _context.SaveChangesAsync();
        var dto = new LessonDto
        {
            Id = lesson.Id,
            Title = lesson.Title,
            Order = lesson.Order,
            Type = lesson.Type,
            VideoUrl = (lesson as VideoLesson)?.VideoUrl,
            TextContent = (lesson as TextLesson)?.TextContent
        };
        return (true, null, dto);
    }
    public async Task<(bool, string?, object?)> CreateTestAsync(int moduleId, TestCreateDto testDto, int instructorId)
    {
        var module = await _context.Modules.FindAsync(moduleId);
        if (module == null) return (false, "Module not found.", null);
        if (!await IsCourseOwner(module.CourseId, instructorId))
        {
            return (false, "You do not own this course.", null);
        }
        var test = new Test
        {
            Title = testDto.Title,
            StrategyType = testDto.StrategyType,
            ModuleId = moduleId
        };
        await _context.Tests.AddAsync(test);
        await _context.SaveChangesAsync();
        return (true, null, test);
    }
    public async Task<(bool, string?, object?)> CreateQuestionAsync(int testId, QuestionCreateDto questionDto, int instructorId)
    {
        var test = await _context.Tests.Include(t => t.Module).FirstOrDefaultAsync(t => t.Id == testId);
        if (test == null) return (false, "Test not found.", null);
        if (!await IsCourseOwner(test.Module.CourseId, instructorId))
        {
            return (false, "You do not own this course.", null);
        }
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
        return (true, null, question);
    }
    public async Task<(bool, string?, object?)> UpdateCourseAsync(int courseId, CourseUpdateDto dto, int instructorId)
    {
        var course = await _context.Courses.FindAsync(courseId);
        if (course == null) return (false, "Course not found.", null);
        if (course.InstructorId != instructorId)
        {
            return (false, "You do not own this course.", null);
        }
        course.Title = dto.Title;
        course.Description = dto.Description;
        course.Level = dto.Level;
        course.CategoryId = dto.CategoryId;
        await _context.SaveChangesAsync();
        return (true, null, course);
    }
    public async Task<(bool, string?, object?)> UpdateModuleAsync(int moduleId, ModuleCreateDto dto, int instructorId)
    {
        var module = await _context.Modules.FindAsync(moduleId);
        if (module == null) return (false, "Module not found.", null);
        if (!await IsCourseOwner(module.CourseId, instructorId))
        {
            return (false, "You do not own this course.", null);
        }
        module.Title = dto.Title;
        module.Order = dto.Order;
        await _context.SaveChangesAsync();
        return (true, null, module);
    }
    public async Task<(bool, string?, object?)> UpdateLessonAsync(int lessonId, LessonCreateDto dto, int instructorId)
    {
        var lesson = await _context.Lessons.Include(l => l.Module).FirstOrDefaultAsync(l => l.Id == lessonId);
        if (lesson == null) return (false, "Lesson not found.", null);
        if (!await IsCourseOwner(lesson.Module.CourseId, instructorId))
        {
            return (false, "You do not own this course.", null);
        }
        if (lesson.Type != dto.Type)
        {
            return (false, "Changing lesson type is not supported.", null);
        }
        lesson.Title = dto.Title;
        lesson.Order = dto.Order;
        if (lesson is VideoLesson videoLesson)
        {
            videoLesson.VideoUrl = dto.VideoUrl;
        }
        else if (lesson is TextLesson textLesson)
        {
            textLesson.TextContent = dto.TextContent;
        }
        await _context.SaveChangesAsync();
        var resultDto = new LessonDto
        {
            Id = lesson.Id,
            Title = lesson.Title,
            Order = lesson.Order,
            Type = lesson.Type,
            VideoUrl = (lesson as VideoLesson)?.VideoUrl,
            TextContent = (lesson as TextLesson)?.TextContent
        };
        return (true, null, resultDto);
    }
    public async Task<(bool, string?, object?)> UpdateTestAsync(int testId, TestCreateDto dto, int instructorId)
    {
        var test = await _context.Tests.Include(t => t.Module).FirstOrDefaultAsync(t => t.Id == testId);
        if (test == null) return (false, "Test not found.", null);
        if (!await IsCourseOwner(test.Module.CourseId, instructorId))
        {
            return (false, "You do not own this course.", null);
        }
        test.Title = dto.Title;
        test.StrategyType = dto.StrategyType;
        await _context.SaveChangesAsync();
        return (true, null, test);
    }
    public async Task<(bool, string?)> DeleteCourseAsync(int courseId, int instructorId)
    {
        var course = await _context.Courses.FindAsync(courseId);
        if (course == null) return (false, "Course not found.");
        if (course.InstructorId != instructorId)
        {
            return (false, "You do not own this course.");
        }
        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();
        return (true, null);
    }
    public async Task<(bool, string?)> DeleteModuleAsync(int moduleId, int instructorId)
    {
        var module = await _context.Modules.FindAsync(moduleId);
        if (module == null) return (false, "Module not found.");
        if (!await IsCourseOwner(module.CourseId, instructorId))
        {
            return (false, "You do not own this course.");
        }
        _context.Modules.Remove(module);
        await _context.SaveChangesAsync();
        return (true, null);
    }
    public async Task<(bool, string?)> DeleteLessonAsync(int lessonId, int instructorId)
    {
        var lesson = await _context.Lessons.Include(l => l.Module).FirstOrDefaultAsync(l => l.Id == lessonId);
        if (lesson == null) return (false, "Lesson not found.");
        if (!await IsCourseOwner(lesson.Module.CourseId, instructorId))
        {
            return (false, "You do not own this course.");
        }
        _context.Lessons.Remove(lesson);
        await _context.SaveChangesAsync();
        return (true, null);
    }
    public async Task<(bool, string?)> DeleteTestAsync(int testId, int instructorId)
    {
        var test = await _context.Tests.Include(t => t.Module).FirstOrDefaultAsync(t => t.Id == testId);
        if (test == null) return (false, "Test not found.");
        if (!await IsCourseOwner(test.Module.CourseId, instructorId))
        {
            return (false, "You do not own this course.");
        }
        _context.Tests.Remove(test);
        await _context.SaveChangesAsync();
        return (true, null);
    }
    public async Task<IEnumerable<CourseDto>> GetMyCoursesAsync(int instructorId)
    {
        return await _context.Courses
            .Where(c => c.InstructorId == instructorId)
            .Select(c => new CourseDto
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Level = c.Level.ToString(),
                InstructorId = c.InstructorId,
                CategoryId = c.CategoryId
            })
            .ToListAsync();
    }
    public async Task<MyCourseDetailsDto?> GetCourseStructureAsync(int courseId, int instructorId)
    {
        if (!await IsCourseOwner(courseId, instructorId))
        {
            return null;
        }
        var course = await _context.Courses
            .Where(c => c.Id == courseId)
            .Include(c => c.Modules.OrderBy(m => m.Order))
                .ThenInclude(m => m.Lessons.OrderBy(l => l.Order))
            .Include(c => c.Modules)
                .ThenInclude(m => m.Test)
            .FirstOrDefaultAsync();
        if (course == null)
        {
            return null;
        }
        var courseDetails = new MyCourseDetailsDto
        {
            CourseId = course.Id,
            Title = course.Title,
            Progress = 0,
            Modules = course.Modules.OrderBy(m => m.Order).Select(m => new ModuleDto
            {
                Id = m.Id,
                Title = m.Title,
                Order = m.Order,
                TotalLessonsCount = m.Lessons.Count,
                CompletedLessonsCount = 0,
                Test = m.Test != null ? new TestDto
                {
                    Id = m.Test.Id,
                    Title = m.Test.Title
                } : null,
                Lessons = m.Lessons.OrderBy(l => l.Order).Select(l => new LessonDto
                {
                    Id = l.Id,
                    Title = l.Title,
                    Order = l.Order,
                    Type = l.Type,
                    VideoUrl = l is VideoLesson videoLesson ? videoLesson.VideoUrl : null,
                    TextContent = l is TextLesson textLesson ? textLesson.TextContent : null,
                    IsCompleted = false,
                    CompletedAt = null
                }).ToList()
            }).ToList()
        };
        if (courseDetails != null)
        {
            courseDetails.TotalLessonsCount = courseDetails.Modules.Sum(m => m.TotalLessonsCount);
            courseDetails.CompletedLessonsCount = 0;
        }
        return courseDetails;
    }
    public async Task<(bool, string?, object?)> CreateCourseAsync(CourseCreateDto dto, int instructorId)
    {
        var course = new Course
        {
            Title = dto.Title,
            Description = dto.Description,
            Level = dto.Level,
            CategoryId = dto.CategoryId,
            InstructorId = instructorId
        };
        await _context.Courses.AddAsync(course);
        await _context.SaveChangesAsync();
        return (true, null, course);
    }
}