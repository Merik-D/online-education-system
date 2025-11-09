using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineEducation.Api.Models;

public class Option
{
    public int Id { get; set; }

    [Required]
    public string Text { get; set; }

    public bool IsCorrect { get; set; } = false;

    public int QuestionId { get; set; }
    [ForeignKey("QuestionId")]
    public virtual Question Question { get; set; }
}