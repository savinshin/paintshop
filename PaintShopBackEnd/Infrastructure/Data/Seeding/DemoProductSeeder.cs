using Microsoft.EntityFrameworkCore;
using PaintShopBackEnd.Domain.Entities;

namespace PaintShopBackEnd.Infrastructure.Data.Seeding;

public static class DemoProductSeeder
{
    private static readonly (string Sku, string Name, string Brand, string? Finish, int? PackageMl,
        decimal Price, int StockQty, string? Hex, string CategorySlug)[] Products =
    [
        ("PS-ABR-SPONGE-001", "Абразивная губка P120", "3M", null, null, 3.90m, 120, null, "abrazivnaya-gubka"),
        ("PS-PRIMER-ACR-001", "Акриловый грунт 1л", "NOVOL", "2K", 1000, 14.50m, 25, null, "akrilovyj-grunt"),
        ("PS-LAK-HS-001", "HS лак 1л", "Standox", "HS", 1000, 29.90m, 12, null, "hs-lak"),
        ("PS-SEAL-SEAM-001", "Шовный герметик 310мл", "3M", null, 310, 9.60m, 40, null, "shovnyj-germetik"),
        ("PS-ENAM-ACR-RED-001", "Акриловая эмаль (красная) 400мл", "Mobihel", "Acrylic", 400, 7.20m, 60, "FF0000", "akrilovaya-emal"),
    ];

    public static async Task SeedAsync(AppDbContext db)
    {
        await using var transaction = await db.Database.BeginTransactionAsync();
        var categorySlugs = Products.Select(item => item.CategorySlug).Distinct().ToArray();
        var categories = await db.Categories
            .Where(category => categorySlugs.Contains(category.Slug))
            .ToDictionaryAsync(category => category.Slug);

        var missing = categorySlugs.Where(slug => !categories.ContainsKey(slug)).ToArray();
        if (missing.Length > 0)
            throw new InvalidOperationException($"Required categories are missing: {string.Join(", ", missing)}. Run seed first.");

        var skus = Products.Select(item => item.Sku).ToArray();
        var existingSkus = (await db.Products.Where(product => skus.Contains(product.Sku))
            .Select(product => product.Sku).ToListAsync()).ToHashSet();

        foreach (var item in Products)
        {
            if (existingSkus.Contains(item.Sku))
                continue;

            var product = new Product(item.Sku, item.Name, item.Brand, item.Finish,
                item.PackageMl, item.Price, "EUR", item.StockQty, item.Hex, null);
            product.ProductCategories.Add(new ProductCategory { CategoryId = categories[item.CategorySlug].Id });
            db.Products.Add(product);
        }

        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        Console.WriteLine("Demo product seed completed.");
    }
}
