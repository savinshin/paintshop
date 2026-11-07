using PaintShopBackEnd.Domain.Entities;

namespace PaintShopBackEnd.Domain.Interfaces
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<Category>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<bool> AllExistAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken);
        Task<Category?> GetByIdAsync(int id);
        Task<Category> CreateAsync(Category category);
        Task<Category> UpdateAsync(Category category);
        Task DeleteAsync(int id);
    }
}
