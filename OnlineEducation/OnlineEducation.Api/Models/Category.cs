using System.ComponentModel.DataAnnotations;

namespace OnlineEducation.Api.Models;

public class Category
{
    public int Id { get; set; }

    [Required]
    public string Name { get; set; }

    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();
}