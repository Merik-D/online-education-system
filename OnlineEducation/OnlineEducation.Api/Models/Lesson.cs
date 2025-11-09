using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineEducation.Api.Models;

public class Lesson
{
    public int Id { get; set; }

    [Required]
    public string Title { get; set; }

    public int Order { get; set; }

    public string? VideoUrl { get; set; }
    public string? TextContent { get; set; }

    public int ModuleId { get; set; }
    [ForeignKey("ModuleId")]
    public virtual Module Module { get; set; }
}