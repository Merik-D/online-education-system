using Microsoft.EntityFrameworkCore;
using OnlineEducation.Api.Data;
using OnlineEducation.Api.Dtos.Certificates;
using OnlineEducation.Api.Interfaces;
using OnlineEducation.Api.Models;
using OnlineEducation.Api.Enums;
namespace OnlineEducation.Api.Services;
public class CertificateService : ICertificateService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CertificateService> _logger;
    public CertificateService(ApplicationDbContext context, ILogger<CertificateService> logger)
    {
        _context = context;
        _logger = logger;
    }
    public async Task<(bool success, string? error, int? certificateId)> GenerateCertificateAsync(int submissionId, int userId)
    {
        var submission = await _context.StudentSubmissions
            .Include(s => s.Test)
                .ThenInclude(t => t.Module)
                    .ThenInclude(m => m.Course)
            .FirstOrDefaultAsync(s => s.Id == submissionId);
        if (submission == null)
        {
            return (false, "Submission not found", null);
        }
        if (submission.StudentId != userId)
        {
            return (false, "Unauthorized", null);
        }
        if (submission.Status != SubmissionStatus.Graded)
        {
            return (false, "Submission must be graded first", null);
        }
        if (!submission.Score.HasValue || submission.Score.Value < 70)
        {
            return (false, "Score must be at least 70% to receive a certificate", null);
        }
        var courseId = submission.Test.Module.CourseId;
        var existingCertificate = await _context.Certificates
            .FirstOrDefaultAsync(c => c.StudentId == userId && c.CourseId == courseId);
        if (existingCertificate != null)
        {
            return (false, "Certificate already exists for this course", existingCertificate.Id);
        }
        var totalLessons = await _context.Lessons
            .Where(l => l.Module.CourseId == courseId)
            .CountAsync();
        var completedLessons = await _context.LessonCompletions
            .Where(lc => lc.StudentId == userId && lc.Lesson.Module.CourseId == courseId)
            .CountAsync();
        if (completedLessons < totalLessons)
        {
            return (false, $"All lessons must be completed. Progress: {completedLessons}/{totalLessons}", null);
        }
        var certificate = new Certificate
        {
            StudentId = userId,
            CourseId = courseId,
            IssuedAt = DateTime.UtcNow,
            SubmissionId = submissionId
        };
        _context.Certificates.Add(certificate);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Certificate {CertificateId} generated for student {StudentId} in course {CourseId}",
            certificate.Id, userId, courseId);
        return (true, null, certificate.Id);
    }
    public async Task<(bool success, string? error, int? certificateId)> GenerateCertificateForCourseAsync(int courseId, int userId)
    {
        var existingCertificate = await _context.Certificates
            .FirstOrDefaultAsync(c => c.StudentId == userId && c.CourseId == courseId);
        if (existingCertificate != null)
        {
            return (false, "Certificate already exists for this course", existingCertificate.Id);
        }
        var totalLessons = await _context.Lessons
            .Where(l => l.Module.CourseId == courseId)
            .CountAsync();
        var completedLessons = await _context.LessonCompletions
            .Where(lc => lc.StudentId == userId && lc.Lesson.Module.CourseId == courseId)
            .CountAsync();
        if (completedLessons < totalLessons)
        {
            return (false, $"All lessons must be completed. Progress: {completedLessons}/{totalLessons}", null);
        }
        var courseTests = await _context.Tests
            .Where(t => t.Module.CourseId == courseId)
            .Select(t => t.Id)
            .ToListAsync();
        if (courseTests.Count == 0)
        {
            return (false, "This course has no tests", null);
        }
        var qualifyingSubmissions = await _context.StudentSubmissions
            .Include(s => s.Test)
                .ThenInclude(t => t.Module)
            .Where(s => s.StudentId == userId &&
                       courseTests.Contains(s.TestId) &&
                       s.Status == SubmissionStatus.Graded &&
                       s.Score.HasValue &&
                       s.Score.Value >= 70)
            .ToListAsync();
        var passedTestIds = qualifyingSubmissions.Select(s => s.TestId).Distinct().ToList();
        if (passedTestIds.Count < courseTests.Count)
        {
            var failedTests = courseTests.Where(t => !passedTestIds.Contains(t)).ToList();
            return (false, $"All tests must be passed with at least 70%. Missing: {failedTests.Count} test(s)", null);
        }
        var bestSubmission = qualifyingSubmissions
            .OrderByDescending(s => s.Score)
            .FirstOrDefault();
        if (bestSubmission == null)
        {
            return (false, "No qualifying submission found", null);
        }
        var certificate = new Certificate
        {
            StudentId = userId,
            CourseId = courseId,
            IssuedAt = DateTime.UtcNow,
            SubmissionId = bestSubmission.Id
        };
        _context.Certificates.Add(certificate);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Certificate {CertificateId} generated for student {StudentId} in course {CourseId} (all tests passed)",
            certificate.Id, userId, courseId);
        return (true, null, certificate.Id);
    }
    public async Task<CertificateDto?> GetCertificateByIdAsync(int certificateId, int userId)
    {
        var certificate = await _context.Certificates
            .Include(c => c.Student)
            .Include(c => c.Course)
            .Include(c => c.Submission)
            .Where(c => c.Id == certificateId)
            .Select(c => new CertificateDto
            {
                Id = c.Id,
                StudentId = c.StudentId,
                StudentName = c.Student.FullName,
                CourseId = c.CourseId,
                CourseTitle = c.Course.Title,
                IssuedAt = c.IssuedAt,
                SubmissionId = c.SubmissionId,
                Score = c.Submission.Score
            })
            .FirstOrDefaultAsync();
        if (certificate == null)
        {
            return null;
        }
        var course = await _context.Courses.FindAsync(certificate.CourseId);
        if (certificate.StudentId != userId && course?.InstructorId != userId)
        {
            return null;
        }
        return certificate;
    }
    public async Task<List<CertificateDto>> GetStudentCertificatesAsync(int studentId)
    {
        return await _context.Certificates
            .Include(c => c.Student)
            .Include(c => c.Course)
            .Include(c => c.Submission)
            .Where(c => c.StudentId == studentId)
            .OrderByDescending(c => c.IssuedAt)
            .Select(c => new CertificateDto
            {
                Id = c.Id,
                StudentId = c.StudentId,
                StudentName = c.Student.FullName,
                CourseId = c.CourseId,
                CourseTitle = c.Course.Title,
                IssuedAt = c.IssuedAt,
                SubmissionId = c.SubmissionId,
                Score = c.Submission.Score
            })
            .ToListAsync();
    }
    public async Task<List<CertificateDto>> GetCourseCertificatesAsync(int courseId, int instructorId)
    {
        var course = await _context.Courses.FindAsync(courseId);
        if (course == null || course.InstructorId != instructorId)
        {
            return new List<CertificateDto>();
        }
        return await _context.Certificates
            .Include(c => c.Student)
            .Include(c => c.Course)
            .Include(c => c.Submission)
            .Where(c => c.CourseId == courseId)
            .OrderByDescending(c => c.IssuedAt)
            .Select(c => new CertificateDto
            {
                Id = c.Id,
                StudentId = c.StudentId,
                StudentName = c.Student.FullName,
                CourseId = c.CourseId,
                CourseTitle = c.Course.Title,
                IssuedAt = c.IssuedAt,
                SubmissionId = c.SubmissionId,
                Score = c.Submission.Score
            })
            .ToListAsync();
    }
}