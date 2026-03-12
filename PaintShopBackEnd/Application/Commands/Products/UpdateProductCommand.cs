namespace PaintShopBackEnd.Application.Commands.Products
{
    public class UpdateProductCommand
    {
        public string Id { get; set; } = null!;
        public string Sku { get; set; } = null!;
        public string Name { get; set; }  = null!;
        public string Brand { get; set; }  = null!;
        public string? Finish { get; set; }
        public int? PackageMl { get; set; }
        public decimal? Price { get; set; }
        public string? Currency { get; set; }
        public int? StockQty { get; set; }
        public string? Hex { get; set; }
        public string? ImageUrl { get; set; }
        public List<int> CategoryIds { get; set; } = new();
    }
}
