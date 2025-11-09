using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineEducation.Api.Dtos.Admin;
using OnlineEducation.Api.Interfaces;

namespace OnlineEducation.Api.Controllers;

[Route("api/admin")]
[ApiController]
[Authorize(Roles = "Admin,Instructor")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("submissions/pending")]
    public async Task<ActionResult<IEnumerable<PendingSubmissionDto>>> GetPendingSubmissions()
    {
        var submissions = await _adminService.GetPendingSubmissionsAsync();
        return Ok(submissions);
    }

    [HttpPost("submissions/{id}/grade")]
    public async Task<IActionResult> GradeSubmission(int id, [FromBody] GradeSubmissionDto gradeDto)
    {
        var result = await _adminService.GradeSubmissionAsync(id, gradeDto);
        if (!result)
        {
            return NotFound(new { message = "Submission not found or already graded." });
        }

        return Ok(new { message = "Submission graded successfully." });
    }
}