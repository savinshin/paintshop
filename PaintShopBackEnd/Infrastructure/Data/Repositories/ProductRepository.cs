using Microsoft.EntityFrameworkCore;
using PaintShopBackEnd.Domain.Entities;
using PaintShopBackEnd.Domain.Interfaces;

namespace PaintShopBackEnd.Infrastructure.Data.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly AppDbContext _context;

        public ProductRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Product> CreateAsync(Product product)
        {
            await _context.Products.AddAsync(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<Product?> GetByIdAsync(string id)
        {
            return await _context.Products
                .Include(p => p.ProductCategories)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            return await _context.Products
                .Include(p => p.ProductCategories)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetByCategoryIdsAsync(IEnumerable<int> categoryIds)
        {
            var ids = categoryIds.Distinct().ToList();
            if (ids.Count == 0)
                return Enumerable.Empty<Product>();
        
            return await _context.Products
                .Include(p => p.ProductCategories)
                .Where(p => p.ProductCategories.Any(pc => ids.Contains(pc.CategoryId)))
                .ToListAsync();
        }

        public async Task<Product> UpdateAsync(Product product)
        {
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task DeleteAsync(string id)
        {
            var product = await GetByIdAsync(id);
            if (product != null)
            {
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
            }
        }
    }
}
