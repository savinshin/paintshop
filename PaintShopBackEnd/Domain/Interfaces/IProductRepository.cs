using PaintShopBackEnd.Domain.Entities;

namespace PaintShopBackEnd.Domain.Interfaces
{
    public interface IProductRepository
    {
        Task<Product> CreateAsync(Product product);
        Task<Product?> GetByIdAsync(string id);
        Task<IEnumerable<Product>> GetAllAsync();
        Task<Product> UpdateAsync(Product product);
        Task DeleteAsync(string id);
        Task<IEnumerable<Product>> GetByCategoryIdsAsync(IEnumerable<int> categoryIds);
    }
}
