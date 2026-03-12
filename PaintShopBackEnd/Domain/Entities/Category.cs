namespace PaintShopBackEnd.Domain.Entities
{
    public class Category
    {
        public int Id { get; set; }

        public string Name { get; set; } = null!;

        public string Slug { get; set; } = null!;

        public int? ParentId { get; set; }
        public Category? Parent { get; set; }
        public ICollection<Category> Children { get; set; } = new List<Category>();

        public int SortOrder { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<ProductCategory> ProductCategories { get; set; }
            = new List<ProductCategory>();
    }
}
