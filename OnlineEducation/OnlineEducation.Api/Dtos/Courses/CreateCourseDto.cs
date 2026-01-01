using System.ComponentModel.DataAnnotations;
using OnlineEducation.Api.Enums;
namespace OnlineEducation.Api.Dtos.Courses;
public class CreateCourseDto
{
    [Required]
    public string Title { get; set; }
    public string Description { get; set; }
    public CourseLevel Level { get; set; }
    [Required]
    public int InstructorId { get; set; }
    [Required]
    public int CategoryId { get; set; }
}