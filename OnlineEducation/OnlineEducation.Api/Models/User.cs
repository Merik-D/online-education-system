using System.ComponentModel.DataAnnotations;

namespace OnlineEducation.Api.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    public string PasswordHash { get; set; }

    public virtual ICollection<Course> CoursesAsInstructor { get; set; } = new List<Course>();
    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}