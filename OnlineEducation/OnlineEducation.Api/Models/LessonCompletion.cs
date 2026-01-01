using System.ComponentModel.DataAnnotations.Schema;
namespace OnlineEducation.Api.Models;
public class LessonCompletion
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    [ForeignKey("StudentId")]
    public virtual User Student { get; set; }
    public int LessonId { get; set; }
    [ForeignKey("LessonId")]
    public virtual Lessons.Lesson Lesson { get; set; }
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
}