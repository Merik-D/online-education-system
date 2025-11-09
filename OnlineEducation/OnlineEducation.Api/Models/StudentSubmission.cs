using System.ComponentModel.DataAnnotations.Schema;
using OnlineEducation.Api.Enums;

namespace OnlineEducation.Api.Models;

public class StudentSubmission
{
    public int Id { get; set; }

    public int StudentId { get; set; }
    [ForeignKey("StudentId")]
    public virtual User Student { get; set; }

    public int TestId { get; set; }
    [ForeignKey("TestId")]
    public virtual Test Test { get; set; }

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public SubmissionStatus Status { get; set; }

    public double? Score { get; set; } // %

    public virtual ICollection<StudentAnswer> Answers { get; set; } = new List<StudentAnswer>();
}