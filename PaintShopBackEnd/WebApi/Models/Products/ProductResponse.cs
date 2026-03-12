namespace PaintShopBackEnd.WebApi.Models.Products
{
    public record ProductResponse(
        string id,
        string sku,
        string name,
        string brand,
        string? finish,
        int? packageMl,
        decimal? price,
        string? currency,
        int? stockQty,
        string? hex,
        string? imageUrl,
        List<int> categoryIds,
        string createdAt
    );
}
