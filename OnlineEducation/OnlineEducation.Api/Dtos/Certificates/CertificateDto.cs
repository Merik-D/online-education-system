namespace OnlineEducation.Api.Dtos.Certificates;
public class CertificateDto
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public string StudentName { get; set; }
    public int CourseId { get; set; }
    public string CourseTitle { get; set; }
    public DateTime IssuedAt { get; set; }
    public int SubmissionId { get; set; }
    public double? Score { get; set; }
}