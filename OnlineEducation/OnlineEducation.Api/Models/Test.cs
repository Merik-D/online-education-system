using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using OnlineEducation.Api.Enums;
namespace OnlineEducation.Api.Models;
public class Test
{
    public int Id { get; set; }
    [Required]
    public string Title { get; set; }
    public int ModuleId { get; set; }
    [ForeignKey("ModuleId")]
    public virtual Module Module { get; set; }
    public GradingStrategyType StrategyType { get; set; }
    public double PassingScore { get; set; } = 70.0;
    public virtual ICollection<Question> Questions { get; set; } = new List<Question>();
}