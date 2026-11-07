using PaintShopBackEnd.Application.Commands.Products;
using PaintShopBackEnd.Domain.Entities;

namespace PaintShopBackEnd.Application.Interfaces
{
    public interface IProductService
    {
        Task<IEnumerable<Product>> GetAllAsync(string? query);
        Task<bool> SkuExistsAsync(string sku, string? excludeId, CancellationToken cancellationToken);
        Task<Product?> GetByIdAsync(string id);
        Task<Product> CreateAsync(CreateProductCommand command);
        Task<Product?> UpdateAsync(string id, UpdateProductCommand command);
        Task DeleteAsync(string id);
        Task<IEnumerable<Product>> GetByCategoryAsync(int categoryId, bool includeDescendants, string? query);
    }
}
