using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace OnlineEducation.Api.Models
{
    public class Certificate
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        [ForeignKey("StudentId")]
        public virtual User Student { get; set; }
        public int CourseId { get; set; }
        [ForeignKey("CourseId")]
        public virtual Course Course { get; set; }
        public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
        public int SubmissionId { get; set; }
        [ForeignKey("SubmissionId")]
        public virtual StudentSubmission Submission { get; set; }
    }
}