namespace PaintShopBackEnd.WebApi.Models.Categories
{
    public record CreateCategoryRequest(
        string Name,
        string? Slug,
        int? ParentId,
        int SortOrder,
        bool IsActive
    );
}
