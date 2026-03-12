namespace PaintShopBackEnd.WebApi.Models.Categories
{
    public record UpdateCategoryRequest(
        string Name,
        string? Slug,
        int? ParentId,
        int SortOrder,
        bool IsActive
    );
}
