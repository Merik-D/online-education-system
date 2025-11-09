using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineEducation.Api.Models;

public class StudentAnswer
{
    public int Id { get; set; }

    public int StudentSubmissionId { get; set; }
    [ForeignKey("StudentSubmissionId")]
    public virtual StudentSubmission StudentSubmission { get; set; }

    public int QuestionId { get; set; }
    [ForeignKey("QuestionId")]
    public virtual Question Question { get; set; }

    public string? AnswerText { get; set; }

    public virtual ICollection<StudentAnswerOption> SelectedOptions { get; set; } = new List<StudentAnswerOption>();
}