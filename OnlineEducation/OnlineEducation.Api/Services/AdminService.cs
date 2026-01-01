using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OnlineEducation.Api.Data;
using OnlineEducation.Api.Dtos.Admin;
using OnlineEducation.Api.Interfaces;
using OnlineEducation.Api.Models;
namespace OnlineEducation.Api.Services;
public class AdminService : IAdminService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<User> _userManager;
    public AdminService(ApplicationDbContext context, UserManager<User> userManager)
    {
        _context = context;
        _userManager = userManager;
    }
    public async Task<UserStatsDto> GetUserStatsAsync()
    {
        var students = await _userManager.GetUsersInRoleAsync("Student");
        var instructors = await _userManager.GetUsersInRoleAsync("Instructor");
        var admins = await _userManager.GetUsersInRoleAsync("Admin");
        return new UserStatsDto
        {
            TotalStudents = students.Count,
            TotalInstructors = instructors.Count,
            TotalAdmins = admins.Count
        };
    }
    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = await _userManager.Users.ToListAsync();
        var userDtos = new List<UserDto>();
        foreach (var user in users)
        {
            userDtos.Add(new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                IsLockedOut = await _userManager.IsLockedOutAsync(user),
                Roles = (await _userManager.GetRolesAsync(user)).ToList()
            });
        }
        return userDtos;
    }
    public async Task<bool> ToggleUserBlockAsync(int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return false;
        }
        if (await _userManager.IsLockedOutAsync(user))
        {
            await _userManager.SetLockoutEndDateAsync(user, null);
        }
        else
        {
            await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.UtcNow.AddYears(100));
        }
        return true;
    }
}