using System.ComponentModel.DataAnnotations;

namespace OnlineEducation.Api.Dtos.Categories;

public class CreateCategoryDto
{
    [Required]
    public string Name { get; set; }
}