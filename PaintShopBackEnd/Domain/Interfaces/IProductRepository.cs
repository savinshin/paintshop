using PaintShopBackEnd.Domain.Entities;

namespace PaintShopBackEnd.Domain.Interfaces
{
    public interface IProductRepository
    {
        Task<Product> CreateAsync(Product product);
        Task<Product?> GetByIdAsync(string id);
        Task<IEnumerable<Product>> GetAllAsync(string? query);
        Task<bool> SkuExistsAsync(string sku, string? excludeId, CancellationToken cancellationToken);
        Task<Product> UpdateAsync(Product product);
        Task DeleteAsync(string id);
        Task<IEnumerable<Product>> GetByCategoryIdsAsync(IEnumerable<int> categoryIds, string? query);
    }
}
