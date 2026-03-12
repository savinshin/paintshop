namespace PaintShopBackEnd.Domain.Entities;

public class Product
{
    private Product() { }

    public Product(
        string sku,
        string name,
        string brand,
        string? finish,
        int? packageMl,
        decimal? price,
        string? currency,
        int? stockQty,
        string? hex,
        string? imageUrl)
    {
        Id = Guid.NewGuid().ToString();

        SetSku(sku);
        SetName(name);
        SetBrand(brand);

        Finish = finish;
        PackageMl = packageMl;
        Price = price;
        Currency = currency;
        StockQty = stockQty;
        Hex = hex;
        ImageUrl = imageUrl;

        CreatedAt = DateTime.UtcNow;
    }

    public string Id { get; private set; } = null!;
    public string Sku { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string Brand { get; private set; } = null!;

    public string? Finish { get; private set; }
    public int? PackageMl { get; private set; }
    public decimal? Price { get; private set; }
    public string? Currency { get; private set; }
    public int? StockQty { get; private set; }
    public string? Hex { get; private set; }
    public string? ImageUrl { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public ICollection<ProductCategory> ProductCategories { get; private set; } = new List<ProductCategory>();

    public void Update(
        string sku,
        string name,
        string brand,
        string? finish,
        int? packageMl,
        decimal? price,
        string? currency,
        int? stockQty,
        string? hex,
        string? imageUrl)
    {
        SetSku(sku);
        SetName(name);
        SetBrand(brand);

        Finish = finish;
        PackageMl = packageMl;
        Price = price;
        Currency = currency;
        StockQty = stockQty;
        Hex = hex;
        ImageUrl = imageUrl;
    }

    private void SetSku(string sku)
    {
        if (string.IsNullOrWhiteSpace(sku)) throw new ArgumentException("SKU is required");
        Sku = sku.Trim().ToUpperInvariant();
    }

    private void SetName(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required");
        Name = name.Trim();
    }

    private void SetBrand(string brand)
    {
        if (string.IsNullOrWhiteSpace(brand)) throw new ArgumentException("Brand is required");
        Brand = brand.Trim();
    }
}
