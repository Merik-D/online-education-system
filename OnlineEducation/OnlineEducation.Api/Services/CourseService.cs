using Microsoft.EntityFrameworkCore;
using OnlineEducation.Api.Data;
using OnlineEducation.Api.Dtos.Courses;
using OnlineEducation.Api.Interfaces;
using OnlineEducation.Api.Models;

namespace OnlineEducation.Api.Services;

public class CourseService : ICourseService
{
    private readonly ApplicationDbContext _context;

    public CourseService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CourseDto>> GetCoursesAsync()
    {
        return await _context.Courses
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

    public async Task<CourseDto?> GetCourseAsync(int id)
    {
        return await _context.Courses
            .Select(c => new CourseDto
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Level = c.Level.ToString(),
                InstructorId = c.InstructorId,
                CategoryId = c.CategoryId
            })
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<CourseDto> CreateCourseAsync(CreateCourseDto createCourseDto)
    {
        var course = new Course
        {
            Title = createCourseDto.Title,
            Description = createCourseDto.Description,
            Level = createCourseDto.Level,
            InstructorId = createCourseDto.InstructorId,
            CategoryId = createCourseDto.CategoryId
        };

        await _context.Courses.AddAsync(course);
        await _context.SaveChangesAsync();

        return new CourseDto
        {
            Id = course.Id,
            Title = course.Title,
            Description = course.Description,
            Level = course.Level.ToString(),
            InstructorId = course.InstructorId,
            CategoryId = course.CategoryId
        };
    }

    public async Task<bool> UpdateCourseAsync(int id, CreateCourseDto updateCourseDto)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null)
        {
            return false;
        }

        course.Title = updateCourseDto.Title;
        course.Description = updateCourseDto.Description;
        course.Level = updateCourseDto.Level;
        course.InstructorId = updateCourseDto.InstructorId;
        course.CategoryId = updateCourseDto.CategoryId;

        _context.Entry(course).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteCourseAsync(int id)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null)
        {
            return false;
        }

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();
        return true;
    }
}