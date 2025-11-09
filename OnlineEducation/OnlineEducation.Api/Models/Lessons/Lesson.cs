using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using OnlineEducation.Api.Enums;

namespace OnlineEducation.Api.Models.Lessons;

public abstract class Lesson
{
    public int Id { get; set; }

    [Required]
    public string Title { get; set; }

    public int Order { get; set; }

    public LessonType Type { get; protected set; }

    public int ModuleId { get; set; }
    [ForeignKey("ModuleId")]
    public virtual Module Module { get; set; }
}