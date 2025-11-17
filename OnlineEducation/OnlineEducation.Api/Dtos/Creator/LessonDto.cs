using System.ComponentModel.DataAnnotations;
using OnlineEducation.Api.Enums;
namespace OnlineEducation.Api.Dtos.Creator;

public class LessonCreateDto
{
    [Required]
    public string Title { get; set; }
    public int Order { get; set; }
    [Required]
    public LessonType Type { get; set; }
    public string? VideoUrl { get; set; }
    public string? TextContent { get; set; }
}