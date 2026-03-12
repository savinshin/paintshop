namespace PaintShopBackEnd.WebApi.Models.Categories
{
    public record CategoryResponse(
        int Id,
        string Name,
        string Slug,
        int? ParentId,
        int SortOrder,
        bool IsActive
    );
}
