using System.Collections.Generic;

namespace PaintShopBackEnd.WebApi.Models.Categories
{
    public record CategoryTreeNode(
        int Id,
        string Name,
        string Slug,
        int? ParentId,
        int SortOrder,
        bool IsActive,
        List<CategoryTreeNode> Children
    );
}
