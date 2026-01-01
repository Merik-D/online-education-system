using System.ComponentModel.DataAnnotations;
namespace OnlineEducation.Api.Dtos.Creator;
public class ModuleCreateDto
{
    [Required]
    public string Title { get; set; }
    public int Order { get; set; }
}