using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineEducation.Api.Dtos.Admin;
using OnlineEducation.Api.Interfaces;

namespace OnlineEducation.Api.Controllers;

[Route("api/admin")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<UserStatsDto>> GetStats()
    {
        var stats = await _adminService.GetUserStatsAsync();
        return Ok(stats);
    }

    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
    {
        var users = await _adminService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpPost("users/{id}/toggle-block")]
    public async Task<IActionResult> ToggleBlockUser(int id)
    {
        var result = await _adminService.ToggleUserBlockAsync(id);
        if (!result)
        {
            return NotFound(new { message = "User not found." });
        }
        return Ok(new { message = "User block status updated." });
    }
}