using PaintShopBackEnd.Application.Commands.Categories;
using PaintShopBackEnd.Domain.Entities;

namespace PaintShopBackEnd.Application.Interfaces
{
    public interface ICategoryService
    {
        Task<IEnumerable<Category>> GetAllAsync();
        Task<Category?> GetByIdAsync(int id);
        Task<Category> CreateAsync(CreateCategoryCommand command);
        Task<Category?> UpdateAsync(int id, UpdateCategoryCommand command);
        Task DeleteAsync(int id);
    }
}
