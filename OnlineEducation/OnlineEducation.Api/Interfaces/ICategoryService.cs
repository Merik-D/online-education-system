using Microsoft.AspNetCore.Mvc;
using OnlineEducation.Api.Dtos.Categories;

namespace OnlineEducation.Api.Interfaces;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetCategoriesAsync();
    Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto createCategoryDto);
}