using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineEducation.Api.Models;

/// <summary>
/// Stores recommendation data for course suggestions
/// </summary>
public class CourseRecommendation
{
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Student user ID
    /// </summary>
    [Required]
    public int StudentId { get; set; }

    [ForeignKey(nameof(StudentId))]
    public User? Student { get; set; }

    /// <summary>
    /// Recommended course ID
    /// </summary>
    [Required]
    public int CourseId { get; set; }

    [ForeignKey(nameof(CourseId))]
    public Course? Course { get; set; }

    /// <summary>
    /// Recommendation score (0.0 - 1.0)
    /// </summary>
    public double Score { get; set; }

    /// <summary>
    /// Reason for recommendation: similar_skill, category_match, popularity, trending
    /// </summary>
    [StringLength(50)]
    public string Reason { get; set; } = "similar_skill";

    /// <summary>
    /// Whether the student viewed this recommendation
    /// </summary>
    public bool Viewed { get; set; }

    /// <summary>
    /// Whether the student enrolled based on this recommendation
    /// </summary>
    public bool Acted { get; set; }

    /// <summary>
    /// Date recommendation was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Date recommendation expires/becomes stale
    /// </summary>
    public DateTime ExpiresAt { get; set; }
}

/// <summary>
/// Tracks course interactions for recommendation algorithm
/// </summary>
public class CourseInteraction
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int StudentId { get; set; }

    [ForeignKey(nameof(StudentId))]
    public User? Student { get; set; }

    [Required]
    public int CourseId { get; set; }

    [ForeignKey(nameof(CourseId))]
    public Course? Course { get; set; }

    /// <summary>
    /// view, enroll, complete, rate, comment
    /// </summary>
    [StringLength(20)]
    public string InteractionType { get; set; } = "view";

    /// <summary>
    /// How much time spent on this course (in minutes)
    /// </summary>
    public int TimeSpentMinutes { get; set; }

    /// <summary>
    /// Optional rating given by user (1-5)
    /// </summary>
    public int? Rating { get; set; }

    /// <summary>
    /// Interaction timestamp
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
