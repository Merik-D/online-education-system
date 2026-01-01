using Microsoft.EntityFrameworkCore;
using OnlineEducation.Api.Data;
using OnlineEducation.Api.Dtos.Categories;
using OnlineEducation.Api.Interfaces;
using OnlineEducation.Api.Models;
namespace OnlineEducation.Api.Services;
public class CategoryService : ICategoryService
{
    private readonly ApplicationDbContext _context;
    public CategoryService(ApplicationDbContext context)
    {
        _context = context;
    }
    public async Task<IEnumerable<CategoryDto>> GetCategoriesAsync()
    {
        return await _context.Categories
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name
            })
            .ToListAsync();
    }
    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto createCategoryDto)
    {
        var category = new Category
        {
            Name = createCategoryDto.Name
        };
        await _context.Categories.AddAsync(category);
        await _context.SaveChangesAsync();
        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name
        };
    }
}