using OnlineEducation.Api.Dtos.Certificates;
namespace OnlineEducation.Api.Interfaces;
public interface ICertificateService
{
    Task<(bool success, string? error, int? certificateId)> GenerateCertificateAsync(int submissionId, int userId);
    Task<(bool success, string? error, int? certificateId)> GenerateCertificateForCourseAsync(int courseId, int userId);
    Task<CertificateDto?> GetCertificateByIdAsync(int certificateId, int userId);
    Task<List<CertificateDto>> GetStudentCertificatesAsync(int studentId);
    Task<List<CertificateDto>> GetCourseCertificatesAsync(int courseId, int instructorId);
}