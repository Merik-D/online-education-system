using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace OnlineEducation.Api.Models;
public class CourseRecommendation
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
    public double Score { get; set; }
    [StringLength(50)]
    public string Reason { get; set; } = "similar_skill";
    public bool Viewed { get; set; }
    public bool Acted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
}
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
    [StringLength(20)]
    public string InteractionType { get; set; } = "view";
    public int TimeSpentMinutes { get; set; }
    public int? Rating { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}