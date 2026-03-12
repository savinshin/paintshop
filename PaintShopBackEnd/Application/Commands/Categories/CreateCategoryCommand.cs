namespace PaintShopBackEnd.Application.Commands.Categories
{
    public class CreateCategoryCommand
    {
        public string Name { get; set; } = null!;
        public string? Slug { get; set; }
        public int? ParentId { get; set; }
        public int SortOrder { get; set; } = 0;
        public bool IsActive { get; set; } = true;
    }
}
