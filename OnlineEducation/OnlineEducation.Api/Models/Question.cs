using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using OnlineEducation.Api.Enums;

namespace OnlineEducation.Api.Models;

public class Question
{
    public int Id { get; set; }

    [Required]
    public string Text { get; set; }

    public QuestionType Type { get; set; }

    public int Order { get; set; }

    public int TestId { get; set; }
    [ForeignKey("TestId")]
    public virtual Test Test { get; set; }

    public virtual ICollection<Option> Options { get; set; } = new List<Option>();
}