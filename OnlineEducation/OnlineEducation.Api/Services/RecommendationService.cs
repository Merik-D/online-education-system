using Microsoft.EntityFrameworkCore;
using OnlineEducation.Api.Data;
using OnlineEducation.Api.Dtos.Courses;
using OnlineEducation.Api.Interfaces;
using OnlineEducation.Api.Models;
namespace OnlineEducation.Api.Services;
public class RecommendationService : IRecommendationService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<RecommendationService> _logger;
    public RecommendationService(ApplicationDbContext context, ILogger<RecommendationService> logger)
    {
        _context = context;
        _logger = logger;
    }
    public async Task<CourseRecommendationListDto> GetRecommendationsAsync(int studentId, int pageNumber, int pageSize)
    {
        var enrolledCourseIds = await _context.Enrollments
            .Where(e => e.StudentId == studentId)
            .Select(e => e.CourseId)
            .ToListAsync();
        var enrolledCategories = await _context.Courses
            .Where(c => enrolledCourseIds.Contains(c.Id))
            .Select(c => c.CategoryId)
            .Distinct()
            .ToListAsync();
        var reviews = await _context.Reviews
            .Where(r => r.StudentId == studentId)
            .Select(r => r.Rating)
            .ToListAsync();
        var avgRatingGiven = reviews.Any() ? reviews.Average() : 0;
        var completedCourses = await _context.Enrollments
            .Where(e => e.StudentId == studentId && e.Progress >= 100)
            .Include(e => e.Course)
            .Select(e => e.Course)
            .ToListAsync();
        var recommendedLevel = completedCourses.Any()
            ? (int)completedCourses.Max(c => c.Level)
            : 0;
        var query = _context.Courses
            .Where(c => !enrolledCourseIds.Contains(c.Id))
            .AsQueryable();
        var scoredCourses = await query
            .Select(c => new
            {
                Course = c,
                CategoryMatch = enrolledCategories.Contains(c.CategoryId) ? 3.0 : 0.0,
                LevelMatch = (int)c.Level == recommendedLevel ? 2.0 : (int)c.Level == recommendedLevel + 1 ? 1.5 : 0.0,
                PopularityScore = c.Enrollments.Count * 0.1,
                RatingScore = c.Reviews.Any() ? c.Reviews.Average(r => r.Rating) * 0.5 : 0.0,
                RecentScore = (DateTime.UtcNow - c.CreatedAt).TotalDays < 30 ? 1.0 : 0.0
            })
            .ToListAsync();
        var recommendations = scoredCourses
            .Select(sc => new
            {
                sc.Course,
                Score = sc.CategoryMatch + sc.LevelMatch + sc.PopularityScore + sc.RatingScore + sc.RecentScore
            })
            .OrderByDescending(x => x.Score)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new RecommendedCourseDto
            {
                Id = x.Course.Id,
                Title = x.Course.Title,
                Description = x.Course.Description,
                Level = x.Course.Level.ToString(),
                RecommendationScore = x.Score,
                RecommendationReason = GetRecommendationReason(x.Course, enrolledCategories, recommendedLevel),
                EnrollmentCount = x.Course.Enrollments.Count,
                AverageRating = x.Course.Reviews.Any() ? x.Course.Reviews.Average(r => r.Rating) : 0.0,
                Category = x.Course.Category != null ? x.Course.Category.Name : "",
                InstructorName = x.Course.Instructor != null ? x.Course.Instructor.FullName : "",
                RecommendationId = 0
            })
            .ToList();
        await SaveRecommendationsAsync(studentId, recommendations);
        var totalRecommendations = scoredCourses.Count;
        return new CourseRecommendationListDto
        {
            Recommendations = recommendations,
            TotalRecommendations = totalRecommendations,
            FilterApplied = "personalized"
        };
    }
    public async Task<CourseRecommendationListDto> GetTrendingCoursesAsync(int pageNumber, int pageSize)
    {
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
        var trendingCourses = await _context.Courses
            .Select(c => new
            {
                Course = c,
                RecentEnrollments = c.Enrollments.Count(e => e.EnrollmentDate >= thirtyDaysAgo),
                RecentInteractions = 0,
                AverageRating = c.Reviews.Any() ? c.Reviews.Average(r => r.Rating) : 0.0,
                TotalEnrollments = c.Enrollments.Count
            })
            .Where(x => x.RecentEnrollments > 0 || x.RecentInteractions > 0)
            .OrderByDescending(x => x.RecentEnrollments * 2 + x.RecentInteractions)
            .ThenByDescending(x => x.AverageRating)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        var totalTrending = await _context.Courses
            .CountAsync(c => c.Enrollments.Any(e => e.EnrollmentDate >= thirtyDaysAgo));
        return new CourseRecommendationListDto
        {
            Recommendations = trendingCourses.Select(tc => new RecommendedCourseDto
            {
                Id = tc.Course.Id,
                Title = tc.Course.Title,
                Description = tc.Course.Description,
                Level = tc.Course.Level.ToString(),
                RecommendationScore = tc.RecentEnrollments,
                RecommendationReason = $"Trending: {tc.RecentEnrollments} recent enrollments",
                EnrollmentCount = tc.TotalEnrollments,
                AverageRating = tc.AverageRating,
                Category = "",
                InstructorName = "",
                RecommendationId = 0
            }).ToList(),
            TotalRecommendations = totalTrending,
            FilterApplied = "trending"
        };
    }
    public async Task<CourseRecommendationListDto> GetSimilarCoursesAsync(int studentId, int pageNumber, int pageSize)
    {
        var enrolledCourses = await _context.Enrollments
            .Where(e => e.StudentId == studentId)
            .Include(e => e.Course)
            .Select(e => e.Course)
            .ToListAsync();
        if (!enrolledCourses.Any())
        {
            return new CourseRecommendationListDto
            {
                Recommendations = new List<RecommendedCourseDto>(),
                TotalRecommendations = 0,
                FilterApplied = "similar"
            };
        }
        var enrolledCourseIds = enrolledCourses.Select(c => c.Id).ToList();
        var enrolledCategories = enrolledCourses.Select(c => c.CategoryId).Distinct().ToList();
        var enrolledInstructors = enrolledCourses.Select(c => c.InstructorId).Distinct().ToList();
        var similarCourses = await _context.Courses
            .Where(c => !enrolledCourseIds.Contains(c.Id) &&
                       (enrolledCategories.Contains(c.CategoryId) ||
                        enrolledInstructors.Contains(c.InstructorId)))
            .Select(c => new
            {
                Course = c,
                CategoryMatch = enrolledCategories.Contains(c.CategoryId),
                InstructorMatch = enrolledInstructors.Contains(c.InstructorId),
                Rating = c.Reviews.Any() ? c.Reviews.Average(r => r.Rating) : 0.0
            })
            .OrderByDescending(x => x.CategoryMatch)
            .ThenByDescending(x => x.InstructorMatch)
            .ThenByDescending(x => x.Rating)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        var totalSimilar = await _context.Courses
            .CountAsync(c => !enrolledCourseIds.Contains(c.Id) &&
                           (enrolledCategories.Contains(c.CategoryId) ||
                            enrolledInstructors.Contains(c.InstructorId)));
        return new CourseRecommendationListDto
        {
            Recommendations = similarCourses.Select(sc => new RecommendedCourseDto
            {
                Id = sc.Course.Id,
                Title = sc.Course.Title,
                Description = sc.Course.Description,
                Level = sc.Course.Level.ToString(),
                RecommendationScore = (sc.CategoryMatch ? 2 : 0) + (sc.InstructorMatch ? 1 : 0),
                RecommendationReason = sc.CategoryMatch
                    ? "Similar category to your enrolled courses"
                    : "Same instructor as your enrolled courses",
                EnrollmentCount = 0,
                AverageRating = sc.Rating,
                Category = "",
                InstructorName = "",
                RecommendationId = 0
            }).ToList(),
            TotalRecommendations = totalSimilar,
            FilterApplied = "similar"
        };
    }
    public async Task MarkRecommendationViewedAsync(int recommendationId)
    {
        var recommendation = await _context.CourseRecommendations
            .FirstOrDefaultAsync(r => r.Id == recommendationId);
        if (recommendation != null)
        {
            recommendation.Viewed = true;
            await _context.SaveChangesAsync();
        }
    }
    public async Task MarkRecommendationActedAsync(int recommendationId)
    {
        var recommendation = await _context.CourseRecommendations
            .FirstOrDefaultAsync(r => r.Id == recommendationId);
        if (recommendation != null)
        {
            recommendation.Acted = true;
            await _context.SaveChangesAsync();
        }
    }
    public async Task GenerateRecommendationsAsync(int studentId, int limit = 10)
    {
        var recommendations = await GetRecommendationsAsync(studentId, 1, limit);
    }
    public async Task TrackInteractionAsync(int studentId, int courseId, string interactionType)
    {
        var interaction = new CourseInteraction
        {
            StudentId = studentId,
            CourseId = courseId,
            InteractionType = interactionType,
            CreatedAt = DateTime.UtcNow
        };
        _context.CourseInteractions.Add(interaction);
        await _context.SaveChangesAsync();
    }
    private string GetRecommendationReason(Course course, List<int> enrolledCategories, int recommendedLevel)
    {
        var reasons = new List<string>();
        if (enrolledCategories.Contains(course.CategoryId))
            reasons.Add("matches your interests");
        if ((int)course.Level == recommendedLevel)
            reasons.Add("matches your skill level");
        else if ((int)course.Level == recommendedLevel + 1)
            reasons.Add("next level progression");
        if (course.Enrollments.Count > 100)
            reasons.Add("popular course");
        if (course.Reviews.Any() && course.Reviews.Average(r => r.Rating) >= 4.5)
            reasons.Add("highly rated");
        if ((DateTime.UtcNow - course.CreatedAt).TotalDays < 30)
            reasons.Add("new course");
        return reasons.Any() ? $"Recommended because it {string.Join(", ", reasons)}" : "Recommended for you";
    }
    private async Task SaveRecommendationsAsync(int studentId, List<RecommendedCourseDto> recommendations)
    {
        var expiresAt = DateTime.UtcNow.AddDays(7);
        foreach (var rec in recommendations.Take(5))
        {
            var existingRec = await _context.CourseRecommendations
                .FirstOrDefaultAsync(cr => cr.StudentId == studentId && cr.CourseId == rec.Id);
            if (existingRec == null)
            {
                var newRec = new CourseRecommendation
                {
                    StudentId = studentId,
                    CourseId = rec.Id,
                    Score = rec.RecommendationScore,
                    Reason = rec.RecommendationReason,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = expiresAt,
                    Viewed = false,
                    Acted = false
                };
                _context.CourseRecommendations.Add(newRec);
            }
        }
        await _context.SaveChangesAsync();
    }
}