namespace PaintShopBackEnd.Application.Commands.Categories
{
    public class UpdateCategoryCommand
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Slug { get; set; }
        public int? ParentId { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
    }
}
