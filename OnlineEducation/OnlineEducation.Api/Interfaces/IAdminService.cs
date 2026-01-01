using OnlineEducation.Api.Dtos.Admin;
namespace OnlineEducation.Api.Interfaces;
public interface IAdminService
{
    Task<UserStatsDto> GetUserStatsAsync();
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
    Task<bool> ToggleUserBlockAsync(int userId);
}