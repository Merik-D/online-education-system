using OnlineEducation.Api.Data;
using OnlineEducation.Api.Dtos.Courses;
using OnlineEducation.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace OnlineEducation.Api.Services;

public interface IRatingService
{
    Task<InstructorRatingDto> GetInstructorRatingsAsync(int instructorId);
    Task<RatingDto> AddRatingAsync(int studentId, int courseId, int rating, string? comment);
    Task<List<RatingDto>> GetCourseRatingsAsync(int courseId);
    Task DeleteRatingAsync(int ratingId);
}

public class RatingService : IRatingService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<RatingService> _logger;

    public RatingService(ApplicationDbContext context, ILogger<RatingService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<InstructorRatingDto> GetInstructorRatingsAsync(int instructorId)
    {
        var instructor = await _context.Users.FindAsync(instructorId);
        if (instructor == null) return new InstructorRatingDto();

        var courses = await _context.Courses
            .Where(c => c.InstructorId == instructorId)
            .Include(c => c.Reviews)
            .ToListAsync();

        var allReviews = courses.SelectMany(c => c.Reviews ?? new List<Review>()).ToList();

        var ratingDistribution = new Dictionary<int, int> { { 1, 0 }, { 2, 0 }, { 3, 0 }, { 4, 0 }, { 5, 0 } };
        foreach (var review in allReviews)
        {
            ratingDistribution[review.Rating]++;
        }

        var avgRating = allReviews.Any() ? allReviews.Average(r => r.Rating) : 0;

        return new InstructorRatingDto
        {
            InstructorId = instructorId,
            InstructorName = instructor.FullName,
            AverageRating = avgRating,
            TotalRatings = allReviews.Count,
            RatingDistribution = ratingDistribution,
            RecentReviews = allReviews
                .OrderByDescending(r => r.CreatedAt)
                .Take(10)
                .Select(r => new RatingDto
                {
                    Id = r.Id,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    StudentName = r.Student?.FullName ?? "Anonymous",
                    CreatedAt = r.CreatedAt,
                    IsVerified = true
                })
                .ToList()
        };
    }

    public async Task<RatingDto> AddRatingAsync(int studentId, int courseId, int rating, string? comment)
    {
        if (rating < 1 || rating > 5)
            throw new ArgumentException("Rating must be between 1 and 5");

        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == courseId);

        if (enrollment == null)
            throw new InvalidOperationException("Student not enrolled in this course");

        var existingReview = await _context.Reviews
            .FirstOrDefaultAsync(r => r.StudentId == studentId && r.CourseId == courseId);

        if (existingReview != null)
        {
            existingReview.Rating = rating;
            existingReview.Comment = comment;
            existingReview.CreatedAt = DateTime.UtcNow;
            _context.Reviews.Update(existingReview);
        }
        else
        {
            var review = new Review
            {
                StudentId = studentId,
                CourseId = courseId,
                Rating = rating,
                Comment = comment,
                CreatedAt = DateTime.UtcNow
            };
            _context.Reviews.Add(review);
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation($"Rating added/updated: Student {studentId}, Course {courseId}, Rating {rating}");

        return new RatingDto
        {
            Rating = rating,
            Comment = comment,
            CreatedAt = DateTime.UtcNow
        };
    }

    public async Task<List<RatingDto>> GetCourseRatingsAsync(int courseId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.CourseId == courseId)
            .Include(r => r.Student)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return reviews.Select(r => new RatingDto
        {
            Id = r.Id,
            Rating = r.Rating,
            Comment = r.Comment,
            StudentName = r.Student?.FullName ?? "Anonymous",
            CreatedAt = r.CreatedAt,
            IsVerified = true
        }).ToList();
    }

    public async Task DeleteRatingAsync(int ratingId)
    {
        var review = await _context.Reviews.FindAsync(ratingId);
        if (review != null)
        {
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Rating {ratingId} deleted");
        }
    }
}
