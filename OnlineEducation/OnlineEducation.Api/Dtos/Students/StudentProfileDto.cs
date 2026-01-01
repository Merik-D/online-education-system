namespace OnlineEducation.Api.Dtos.Students;
public class StudentProfileDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public int EnrolledCourses { get; set; }
    public int CertificatesCount { get; set; }
}