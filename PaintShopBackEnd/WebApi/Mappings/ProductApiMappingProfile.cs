using AutoMapper;
using PaintShopBackEnd.Application.Commands.Products;
using PaintShopBackEnd.Domain.Entities;
using PaintShopBackEnd.WebApi.Models.Products;
using System.Linq;

namespace PaintShopBackEnd.WebApi.Mappings
{
    public class ProductApiMappingProfile : Profile
    {
        public ProductApiMappingProfile()
        {
            // Request -> Command
            CreateMap<CreateProductRequest, CreateProductCommand>();
            CreateMap<UpdateProductRequest, UpdateProductCommand>();

            // Domain -> Response
            CreateMap<Product, ProductResponse>()
                .ConstructUsing(p => new ProductResponse(
                    p.Id,
                    p.Sku,
                    p.Name,
                    p.Brand,
                    p.Finish,
                    p.PackageMl,
                    p.Price,
                    p.Currency,
                    p.StockQty,
                    p.Hex,
                    p.ImageUrl,
                    p.ProductCategories
                        .Select(pc => pc.CategoryId)
                        .ToList(),
                    p.CreatedAt.ToString("O")
                ));
        }
    }
}
