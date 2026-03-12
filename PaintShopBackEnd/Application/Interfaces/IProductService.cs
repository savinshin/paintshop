using PaintShopBackEnd.Application.Commands.Products;
using PaintShopBackEnd.Domain.Entities;

namespace PaintShopBackEnd.Application.Interfaces
{
    public interface IProductService
    {
        Task<IEnumerable<Product>> GetAllAsync();
        Task<Product?> GetByIdAsync(string id);
        Task<Product> CreateAsync(CreateProductCommand command);
        Task<Product?> UpdateAsync(string id, UpdateProductCommand command);
        Task DeleteAsync(string id);
        Task<IEnumerable<Product>> GetByCategoryAsync(int categoryId, bool includeDescendants);
    }
}
