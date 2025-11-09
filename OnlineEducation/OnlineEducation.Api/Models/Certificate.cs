using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineEducation.Api.Models
{
    public class Certificate
    {
        public int Id { get; set; }

        [Required]
        public string CertificateUrl { get; set; }

        public DateTime IssueDate { get; set; }

        public int EnrollmentId { get; set; }
        [ForeignKey("EnrollmentId")]
        public virtual Enrollment Enrollment { get; set; }
    }
}