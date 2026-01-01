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
    public async Task<CourseSearchResultDto> SearchCoursesAsync(CourseSearchDto searchDto)
    {
        var query = _context.Courses.AsQueryable();
        if (!string.IsNullOrWhiteSpace(searchDto.SearchTerm))
        {
            var searchTerm = searchDto.SearchTerm.ToLower();
            query = query.Where(c =>
                c.Title.ToLower().Contains(searchTerm) ||
                c.Description.ToLower().Contains(searchTerm));
        }
        if (searchDto.CategoryId.HasValue)
        {
            query = query.Where(c => c.CategoryId == searchDto.CategoryId.Value);
        }
        if (searchDto.InstructorId.HasValue)
        {
            query = query.Where(c => c.InstructorId == searchDto.InstructorId.Value);
        }
        if (searchDto.Level.HasValue)
        {
            query = query.Where(c => (int)c.Level == searchDto.Level.Value);
        }
        if (searchDto.MinRating.HasValue)
        {
            query = query.Where(c =>
                c.Reviews.Any() &&
                c.Reviews.Average(r => (decimal)r.Rating) >= searchDto.MinRating.Value);
        }
        var sortBy = searchDto.SortBy?.ToLower() ?? "title";
        var isDescending = searchDto.IsDescending ?? false;
        query = sortBy switch
        {
            "rating" => isDescending
                ? query.OrderByDescending(c => c.Reviews.Any() ? c.Reviews.Average(r => r.Rating) : 0)
                : query.OrderBy(c => c.Reviews.Any() ? c.Reviews.Average(r => r.Rating) : 0),
            "enrollments" => isDescending
                ? query.OrderByDescending(c => c.Enrollments.Count)
                : query.OrderBy(c => c.Enrollments.Count),
            "newest" => isDescending
                ? query.OrderByDescending(c => c.CreatedAt)
                : query.OrderBy(c => c.CreatedAt),
            _ => isDescending
                ? query.OrderByDescending(c => c.Title)
                : query.OrderBy(c => c.Title)
        };
        var totalCount = await query.CountAsync();
        var pageNumber = Math.Max(1, searchDto.PageNumber);
        var pageSize = Math.Min(100, Math.Max(1, searchDto.PageSize));
        var courses = await query
            .Include(c => c.Instructor)
            .Include(c => c.Category)
            .Include(c => c.Reviews)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CourseDto
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Level = c.Level.ToString(),
                InstructorId = c.InstructorId,
                InstructorName = c.Instructor.FullName,
                CategoryId = c.CategoryId,
                CategoryName = c.Category != null ? c.Category.Name : null,
                AverageRating = c.Reviews.Any() ? (decimal?)c.Reviews.Average(r => r.Rating) : null,
                ReviewCount = c.Reviews.Count
            })
            .ToListAsync();
        return new CourseSearchResultDto
        {
            Courses = courses,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }
}