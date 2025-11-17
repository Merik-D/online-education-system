using System.ComponentModel.DataAnnotations;
using OnlineEducation.Api.Enums;
namespace OnlineEducation.Api.Dtos.Creator;

public class TestCreateDto
{
    [Required]
    public string Title { get; set; }
    [Required]
    public GradingStrategyType StrategyType { get; set; }
}