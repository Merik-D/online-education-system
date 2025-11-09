using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineEducation.Api.Models;

public class StudentAnswerOption
{
    public int Id { get; set; }

    public int StudentAnswerId { get; set; }
    [ForeignKey("StudentAnswerId")]
    public virtual StudentAnswer StudentAnswer { get; set; }

    public int OptionId { get; set; }
    [ForeignKey("OptionId")]
    public virtual Option Option { get; set; }
}