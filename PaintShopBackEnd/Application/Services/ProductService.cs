using PaintShopBackEnd.Application.Commands.Products;
using PaintShopBackEnd.Application.Interfaces;
using PaintShopBackEnd.Domain.Entities;
using PaintShopBackEnd.Domain.Interfaces;

namespace PaintShopBackEnd.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repo;
    private readonly ICategoryRepository _categoryRepo;

    public ProductService(IProductRepository repo, ICategoryRepository categoryRepo)
    {
        _repo = repo;
        _categoryRepo = categoryRepo;
    }

    public Task<IEnumerable<Product>> GetAllAsync() => _repo.GetAllAsync();

    public Task<Product?> GetByIdAsync(string id) => _repo.GetByIdAsync(id);

    public async Task<Product> CreateAsync(CreateProductCommand command)
    {

        var product = new Product(
            command.Sku,
            command.Name,
            command.Brand,
            command.Finish,
            command.PackageMl,
            command.Price,
            command.Currency,
            command.StockQty,
            command.Hex,
            command.ImageUrl
        );

        if (command.CategoryIds is { Count: > 0 })
        {
            foreach (var cid in command.CategoryIds.Distinct())
            {
                product.ProductCategories.Add(new ProductCategory
                {
                    ProductId = product.Id,
                    CategoryId = cid
                });
            }
        }

        return await _repo.CreateAsync(product);
    }

    public async Task<Product?> UpdateAsync(string id, UpdateProductCommand command)
    {
        if (id != command.Id)
            throw new ArgumentException("Route id must match body id");

        var existing = await _repo.GetByIdAsync(id);
        if (existing == null) return null;

        existing.Update(
            command.Sku,
            command.Name,
            command.Brand,
            command.Finish,
            command.PackageMl,
            command.Price,
            command.Currency,
            command.StockQty,
            command.Hex,
            command.ImageUrl
        );

        var newIds = (command.CategoryIds ?? new List<int>())
            .Distinct()
            .ToHashSet();

        var toRemove = existing.ProductCategories
            .Where(pc => !newIds.Contains(pc.CategoryId))
            .ToList();

        foreach (var pc in toRemove)
            existing.ProductCategories.Remove(pc);

        foreach (var cid in newIds)
        {
            if (!existing.ProductCategories.Any(pc => pc.CategoryId == cid))
            {
                existing.ProductCategories.Add(new ProductCategory
                {
                    ProductId = existing.Id,
                    CategoryId = cid
                });
            }
        }

        return await _repo.UpdateAsync(existing);
    }

    public async Task DeleteAsync(string id)
    {
        await _repo.DeleteAsync(id);
    }

    public async Task<IEnumerable<Product>> GetByCategoryAsync(int categoryId, bool includeDescendants)
    {
        if (!includeDescendants)
            return await _repo.GetByCategoryIdsAsync(new[] { categoryId });

        var allCategories = (await _categoryRepo.GetAllAsync()).ToList();
        var ids = new List<int>();
        CollectCategoryIds(categoryId, allCategories, ids);

        return await _repo.GetByCategoryIdsAsync(ids);
    }

    private static void CollectCategoryIds(int rootId, List<Category> all, List<int> result)
    {
        if (result.Contains(rootId))
            return;

        result.Add(rootId);

        var children = all.Where(c => c.ParentId == rootId).ToList();
        foreach (var child in children)
            CollectCategoryIds(child.Id, all, result);
    }
}
