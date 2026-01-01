using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineEducation.Api.Dtos.Certificates;
using OnlineEducation.Api.Extensions;
using OnlineEducation.Api.Interfaces;
namespace OnlineEducation.Api.Controllers;
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CertificatesController : ControllerBase
{
    private readonly ICertificateService _certificateService;
    public CertificatesController(ICertificateService certificateService)
    {
        _certificateService = certificateService;
    }
    [HttpPost("generate/{submissionId}")]
    public async Task<IActionResult> GenerateCertificate(int submissionId)
    {
        var userId = User.GetUserId();
        var (success, error, certificateId) = await _certificateService.GenerateCertificateAsync(submissionId, userId);
        if (!success)
        {
            return BadRequest(new { error });
        }
        return Ok(new { certificateId, message = "Certificate generated successfully" });
    }
    [HttpPost("generate/course/{courseId}")]
    public async Task<IActionResult> GenerateCertificateForCourse(int courseId)
    {
        var userId = User.GetUserId();
        var (success, error, certificateId) = await _certificateService.GenerateCertificateForCourseAsync(courseId, userId);
        if (!success)
        {
            return BadRequest(new { error });
        }
        return Ok(new { certificateId, message = "Certificate generated successfully" });
    }
    [HttpGet("{id}")]
    public async Task<ActionResult<CertificateDto>> GetCertificate(int id)
    {
        var userId = User.GetUserId();
        var certificate = await _certificateService.GetCertificateByIdAsync(id, userId);
        if (certificate == null)
        {
            return NotFound(new { error = "Certificate not found or access denied" });
        }
        return Ok(certificate);
    }
    [HttpGet("my-certificates")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<List<CertificateDto>>> GetMyCertificates()
    {
        var userId = User.GetUserId();
        var certificates = await _certificateService.GetStudentCertificatesAsync(userId);
        return Ok(certificates);
    }
    [HttpGet("course/{courseId}")]
    [Authorize(Roles = "Instructor,Admin")]
    public async Task<ActionResult<List<CertificateDto>>> GetCourseCertificates(int courseId)
    {
        var userId = User.GetUserId();
        var certificates = await _certificateService.GetCourseCertificatesAsync(courseId, userId);
        return Ok(certificates);
    }
}