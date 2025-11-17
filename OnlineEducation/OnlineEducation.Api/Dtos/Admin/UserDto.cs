namespace OnlineEducation.Api.Dtos.Admin;

public class UserDto
{
    public int Id { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public List<string> Roles { get; set; }
    public bool IsLockedOut { get; set; }
}