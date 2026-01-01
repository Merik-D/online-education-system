using OnlineEducation.Api.Dtos.Courses;
namespace OnlineEducation.Api.Interfaces;
public interface IRecommendationService
{
    Task GenerateRecommendationsAsync(int studentId, int limit = 10);
    Task<CourseRecommendationListDto> GetRecommendationsAsync(int studentId, int pageNumber = 1, int pageSize = 10);
    Task TrackInteractionAsync(int studentId, int courseId, string interactionType);
    Task MarkRecommendationViewedAsync(int recommendationId);
    Task<CourseRecommendationListDto> GetTrendingCoursesAsync(int pageNumber = 1, int pageSize = 10);
    Task<CourseRecommendationListDto> GetSimilarCoursesAsync(int studentId, int pageNumber = 1, int pageSize = 10);
}