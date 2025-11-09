using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineEducation.Api.Models;

public class Module
{
    public int Id { get; set; }

    [Required]
    public string Title { get; set; }

    public int Order { get; set; }

    public int CourseId { get; set; }
    [ForeignKey("CourseId")]
    public virtual Course Course { get; set; }

    public virtual ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
    public virtual Test? Test { get; set; }
}