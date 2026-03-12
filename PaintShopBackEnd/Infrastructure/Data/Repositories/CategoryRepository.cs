using Microsoft.EntityFrameworkCore;
using PaintShopBackEnd.Domain.Entities;
using PaintShopBackEnd.Domain.Interfaces;

namespace PaintShopBackEnd.Infrastructure.Data.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly AppDbContext _context;

        public CategoryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            return await _context.Categories
                .AsNoTracking()
                .OrderBy(c => c.ParentId)
                .ThenBy(c => c.SortOrder)
                .ToListAsync();
        }

        public async Task<Category?> GetByIdAsync(int id)
        {
            return await _context.Categories
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Category> CreateAsync(Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return category;
        }

        public async Task<Category> UpdateAsync(Category category)
        {
            _context.Categories.Update(category);
            await _context.SaveChangesAsync();
            return category;
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _context.Categories.FindAsync(id);
            if (entity == null) return;

            _context.Categories.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
