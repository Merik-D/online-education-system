using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineEducation.Api.Dtos.Admin;
using OnlineEducation.Api.Interfaces;

namespace OnlineEducation.Api.Controllers;

[Route("api/instructor")]
[ApiController]
[Authorize(Roles = "Instructor")]
public class InstructorController : ControllerBase
{
    private readonly IInstructorService _instructorService;

    public InstructorController(IInstructorService instructorService)
    {
        _instructorService = instructorService;
    }

    [HttpGet("submissions/pending")]
    public async Task<ActionResult<IEnumerable<PendingSubmissionDto>>> GetPendingSubmissions()
    {
        var submissions = await _instructorService.GetPendingSubmissionsAsync();
        return Ok(submissions);
    }

    [HttpPost("submissions/{id}/grade")]
    public async Task<IActionResult> GradeSubmission(int id, [FromBody] GradeSubmissionDto gradeDto)
    {
        var result = await _instructorService.GradeSubmissionAsync(id, gradeDto);
        if (!result)
        {
            return NotFound(new { message = "Submission not found or already graded." });
        }

        return Ok(new { message = "Submission graded successfully." });
    }
}