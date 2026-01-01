using System.ComponentModel.DataAnnotations.Schema;
namespace OnlineEducation.Api.Models;
public class Enrollment
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    [ForeignKey("StudentId")]
    public virtual User Student { get; set; }
    public int CourseId { get; set; }
    [ForeignKey("CourseId")]
    public virtual Course Course { get; set; }
    public double Progress { get; set; } = 0.0;
    public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;
}