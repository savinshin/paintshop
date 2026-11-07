using Microsoft.EntityFrameworkCore;
using Npgsql;
using PaintShopBackEnd.Domain.Exceptions;
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
            await SaveProductAsync();
            return product;
        }

        public async Task<Product?> GetByIdAsync(string id)
        {
            return await _context.Products
                .Include(p => p.ProductCategories)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public Task<bool> SkuExistsAsync(string sku, string? excludeId, CancellationToken cancellationToken)
        {
            return _context.Products.AnyAsync(p => p.Sku == sku && p.Id != excludeId, cancellationToken);
        }

        public async Task<IEnumerable<Product>> GetAllAsync(string? query)
        {
            return await ApplySearch(_context.Products.Include(p => p.ProductCategories), query).ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetByCategoryIdsAsync(IEnumerable<int> categoryIds, string? query)
        {
            var ids = categoryIds.Distinct().ToList();
            if (ids.Count == 0)
                return Enumerable.Empty<Product>();

            var products = _context.Products.Include(p => p.ProductCategories)
                .Where(p => p.ProductCategories.Any(pc => ids.Contains(pc.CategoryId)));
            return await ApplySearch(products, query).ToListAsync();
        }

        private static IQueryable<Product> ApplySearch(IQueryable<Product> products, string? query)
        {
            var term = query?.Trim();
            if (string.IsNullOrEmpty(term)) return products;

            var pattern = "%" + term.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_") + "%";
            return products.Where(p => EF.Functions.ILike(p.Name, pattern, "\\") ||
                EF.Functions.ILike(p.Brand, pattern, "\\") || EF.Functions.ILike(p.Sku, pattern, "\\"));
        }

        private async Task SaveProductAsync()
        {
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is PostgresException
                { SqlState: PostgresErrorCodes.UniqueViolation, ConstraintName: "IX_Products_Sku" })
            {
                throw new DuplicateSkuException(ex);
            }
        }

        public async Task<Product> UpdateAsync(Product product)
        {
            _context.Products.Update(product);
            await SaveProductAsync();
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
