namespace PaintShopBackEnd.Domain.Entities
{
    public class ProductCategory
    {
        public string ProductId { get; set; } = null!;
        public Product Product { get; set; } = null!;

        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;
    }
}
