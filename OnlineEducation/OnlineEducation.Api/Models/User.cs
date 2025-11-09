using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace OnlineEducation.Api.Models;

public class User : IdentityUser<int>
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; }

    public virtual ICollection<Course> CoursesAsInstructor { get; set; } = new List<Course>();
    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}