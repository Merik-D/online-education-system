using Microsoft.AspNetCore.Mvc;
using OnlineEducation.Api.Data;
using OnlineEducation.Api.Dtos.Users;
using OnlineEducation.Api.Models;

namespace OnlineEducation.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult<User>> CreateUser([FromBody] CreateUserDto createUserDto)
    {
        var user = new User
        {
            FullName = createUserDto.FullName,
            Email = createUserDto.Email,
            // temporary 
            PasswordHash = createUserDto.Password
        };

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        return Ok(user);
    }
}