using OnlineEducation.Api.Data;
using OnlineEducation.Api.Dtos.Courses;
using OnlineEducation.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace OnlineEducation.Api.Interfaces;

public interface IRecommendationService
{
    /// <summary>
    /// Generate recommendations for a specific student
    /// </summary>
    Task GenerateRecommendationsAsync(int studentId, int limit = 10);

    /// <summary>
    /// Get recommendations for a student
    /// </summary>
    Task<CourseRecommendationListDto> GetRecommendationsAsync(int studentId, int pageNumber = 1, int pageSize = 10);

    /// <summary>
    /// Track user interaction with a course
    /// </summary>
    Task TrackInteractionAsync(int studentId, int courseId, string interactionType);

    /// <summary>
    /// Update recommendation as viewed
    /// </summary>
    Task MarkRecommendationViewedAsync(int recommendationId);

    /// <summary>
    /// Get trending courses
    /// </summary>
    Task<CourseRecommendationListDto> GetTrendingCoursesAsync(int pageNumber = 1, int pageSize = 10);

    /// <summary>
    /// Get courses similar to enrolled courses
    /// </summary>
    Task<CourseRecommendationListDto> GetSimilarCoursesAsync(int studentId, int pageNumber = 1, int pageSize = 10);
}

public class RecommendationService : IRecommendationService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<RecommendationService> _logger;

    public RecommendationService(ApplicationDbContext context, ILogger<RecommendationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task GenerateRecommendationsAsync(int studentId, int limit = 10)
    {
        try
        {
            // Clear expired recommendations
            var expiredRecs = await _context.CourseRecommendations
                .Where(r => r.StudentId == studentId && r.ExpiresAt < DateTime.UtcNow)
                .ToListAsync();

            _context.CourseRecommendations.RemoveRange(expiredRecs);

            // Get student's enrolled courses and their categories
            var enrolledCourseIds = await _context.Enrollments
                .Where(e => e.StudentId == studentId)
                .Select(e => e.CourseId)
                .ToListAsync();

            var enrolledCategories = await _context.Courses
                .Where(c => enrolledCourseIds.Contains(c.Id))
                .Select(c => c.CategoryId)
                .Distinct()
                .ToListAsync();

            // Get courses student hasn't enrolled in
            var candidateCourses = await _context.Courses
                .Where(c => !enrolledCourseIds.Contains(c.Id))
                .Include(c => c.Category)
                .ToListAsync();

            var recommendations = new List<CourseRecommendation>();

            foreach (var course in candidateCourses.Take(limit * 2))
            {
                var score = CalculateRecommendationScore(
                    course,
                    enrolledCategories,
                    enrolledCourseIds
                );

                if (score > 0.3) // Only add if score above threshold
                {
                    var recommendation = new CourseRecommendation
                    {
                        StudentId = studentId,
                        CourseId = course.Id,
                        Score = score,
                        Reason = DetermineRecommendationReason(course, enrolledCategories),
                        CreatedAt = DateTime.UtcNow,
                        ExpiresAt = DateTime.UtcNow.AddDays(30)
                    };

                    recommendations.Add(recommendation);
                }
            }

            // Sort by score and take top limit
            var topRecommendations = recommendations
                .OrderByDescending(r => r.Score)
                .Take(limit)
                .ToList();

            _context.CourseRecommendations.AddRange(topRecommendations);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Generated {Count} recommendations for student {StudentId}",
                topRecommendations.Count, studentId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating recommendations for student {StudentId}", studentId);
        }
    }

    public async Task<CourseRecommendationListDto> GetRecommendationsAsync(int studentId, int pageNumber = 1, int pageSize = 10)
    {
        try
        {
            var recommendations = await _context.CourseRecommendations
                .Where(r => r.StudentId == studentId && r.ExpiresAt > DateTime.UtcNow)
                .Include(r => r.Course!)
                    .ThenInclude(c => c.Category)
                .Include(r => r.Course!)
                    .ThenInclude(c => c.Instructor)
                .OrderByDescending(r => r.Score)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = recommendations.Select(r => MapToRecommendedCourseDto(r)).ToList();

            return new CourseRecommendationListDto
            {
                TotalRecommendations = await _context.CourseRecommendations
                    .CountAsync(r => r.StudentId == studentId && r.ExpiresAt > DateTime.UtcNow),
                Recommendations = dtos,
                FilterApplied = "all"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recommendations for student {StudentId}", studentId);
            return new CourseRecommendationListDto();
        }
    }

    public async Task TrackInteractionAsync(int studentId, int courseId, string interactionType)
    {
        try
        {
            var existingInteraction = await _context.CourseInteractions
                .Where(ci => ci.StudentId == studentId && ci.CourseId == courseId && ci.InteractionType == interactionType)
                .FirstOrDefaultAsync();

            if (existingInteraction != null)
            {
                existingInteraction.CreatedAt = DateTime.UtcNow;
                _context.CourseInteractions.Update(existingInteraction);
            }
            else
            {
                var interaction = new CourseInteraction
                {
                    StudentId = studentId,
                    CourseId = courseId,
                    InteractionType = interactionType,
                    CreatedAt = DateTime.UtcNow
                };
                _context.CourseInteractions.Add(interaction);
            }

            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error tracking interaction for student {StudentId} on course {CourseId}",
                studentId, courseId);
        }
    }

    public async Task MarkRecommendationViewedAsync(int recommendationId)
    {
        try
        {
            var recommendation = await _context.CourseRecommendations.FindAsync(recommendationId);
            if (recommendation != null)
            {
                recommendation.Viewed = true;
                _context.CourseRecommendations.Update(recommendation);
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking recommendation {RecommendationId} as viewed", recommendationId);
        }
    }

    public async Task<CourseRecommendationListDto> GetTrendingCoursesAsync(int pageNumber = 1, int pageSize = 10)
    {
        try
        {
            var trendingCourses = await _context.Courses
                .Include(c => c.Category)
                .Include(c => c.Instructor)
                .Include(c => c.Enrollments)
                .Include(c => c.Reviews)
                .OrderByDescending(c => c.Enrollments.Count)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = trendingCourses.Select(c => new RecommendedCourseDto
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Level = c.Level.ToString(),
                EnrollmentCount = c.Enrollments?.Count ?? 0,
                AverageRating = c.Reviews?.Any() == true ? c.Reviews.Average(r => r.Rating) : 0,
                Category = c.Category?.Name ?? "Uncategorized",
                RecommendationScore = c.Enrollments?.Count ?? 0 / 1000.0,
                RecommendationReason = "trending",
                InstructorName = c.Instructor?.FullName ?? "Unknown"
            }).ToList();

            return new CourseRecommendationListDto
            {
                TotalRecommendations = await _context.Courses.CountAsync(),
                Recommendations = dtos,
                FilterApplied = "trending"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting trending courses");
            return new CourseRecommendationListDto();
        }
    }

    public async Task<CourseRecommendationListDto> GetSimilarCoursesAsync(int studentId, int pageNumber = 1, int pageSize = 10)
    {
        try
        {
            var enrolledCategories = await _context.Enrollments
                .Where(e => e.StudentId == studentId)
                .Include(e => e.Course)
                .Select(e => e.Course.CategoryId)
                .Distinct()
                .ToListAsync();

            var enrolledCourseIds = await _context.Enrollments
                .Where(e => e.StudentId == studentId)
                .Select(e => e.CourseId)
                .ToListAsync();

            var similarCourses = await _context.Courses
                .Where(c => !enrolledCourseIds.Contains(c.Id) && enrolledCategories.Contains(c.CategoryId))
                .Include(c => c.Category)
                .Include(c => c.Instructor)
                .Include(c => c.Reviews)
                .Include(c => c.Enrollments)
                .OrderByDescending(c => c.Reviews!.Count > 0 ? c.Reviews.Average(r => r.Rating) : 0)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = similarCourses.Select(c => new RecommendedCourseDto
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Level = c.Level.ToString(),
                EnrollmentCount = c.Enrollments?.Count ?? 0,
                AverageRating = c.Reviews?.Any() == true ? c.Reviews.Average(r => r.Rating) : 0,
                Category = c.Category?.Name ?? "Uncategorized",
                RecommendationScore = c.Reviews?.Any() == true ? c.Reviews.Average(r => r.Rating) / 5.0 : 0.5,
                RecommendationReason = "similar_category",
                InstructorName = c.Instructor?.FullName ?? "Unknown"
            }).ToList();

            return new CourseRecommendationListDto
            {
                TotalRecommendations = await _context.Courses
                    .CountAsync(c => !enrolledCourseIds.Contains(c.Id) && enrolledCategories.Contains(c.CategoryId)),
                Recommendations = dtos,
                FilterApplied = "similar_category"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting similar courses for student {StudentId}", studentId);
            return new CourseRecommendationListDto();
        }
    }

    private double CalculateRecommendationScore(Course course, List<int> studentCategoryIds, List<int> enrolledCourseIds)
    {
        double score = 0.5; // Base score

        // Category match (0.3 points)
        if (studentCategoryIds.Contains(course.CategoryId))
        {
            score += 0.3;
        }

        // Rating bonus (0.2 points if well-rated)
        if (course.Reviews?.Any() == true)
        {
            var avgRating = course.Reviews.Average(r => r.Rating);
            if (avgRating >= 4.0)
                score += 0.2;
        }

        // Popularity bonus (0.15 points if many enrollments)
        if (course.Enrollments?.Count > 50)
        {
            score += 0.15;
        }

        // Cap at 1.0
        return Math.Min(score, 1.0);
    }

    private string DetermineRecommendationReason(Course course, List<int> enrolledCategoryIds)
    {
        if (enrolledCategoryIds.Contains(course.CategoryId))
            return "similar_category";

        if (course.Reviews?.Average(r => r.Rating) >= 4.5)
            return "popular";

        if (course.Enrollments?.Count > 100)
            return "trending";

        return "similar_skill";
    }

    private RecommendedCourseDto MapToRecommendedCourseDto(CourseRecommendation rec)
    {
        return new RecommendedCourseDto
        {
            Id = rec.Course?.Id ?? 0,
            Title = rec.Course?.Title ?? string.Empty,
            Description = rec.Course?.Description ?? string.Empty,
            Level = rec.Course?.Level.ToString() ?? string.Empty,
            EnrollmentCount = rec.Course?.Enrollments?.Count ?? 0,
            AverageRating = rec.Course?.Reviews?.Any() == true ? rec.Course.Reviews.Average(r => r.Rating) : 0,
            Category = rec.Course?.Category?.Name ?? "Uncategorized",
            RecommendationScore = rec.Score,
            RecommendationReason = rec.Reason,
            InstructorName = rec.Course?.Instructor?.FullName ?? "Unknown",
            RecommendationId = rec.Id
        };
    }
}
