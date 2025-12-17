using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineEducation.Api.Models;

public class Review
{
    public int Id { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    public string? Comment { get; set; }

    public int StudentId { get; set; }
    [ForeignKey("StudentId")]
    public virtual User Student { get; set; }

    public int CourseId { get; set; }
    [ForeignKey("CourseId")]
    public virtual Course Course { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}