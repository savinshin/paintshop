using AutoMapper;
using PaintShopBackEnd.Application.Commands.Categories;
using PaintShopBackEnd.Domain.Entities;
using PaintShopBackEnd.WebApi.Models.Categories;

namespace PaintShopBackEnd.WebApi.Mappings
{
    public class CategoryApiMappingProfile : Profile
    {
        public CategoryApiMappingProfile()
        {
            // Request -> Command
            CreateMap<CreateCategoryRequest, CreateCategoryCommand>();
            CreateMap<UpdateCategoryRequest, UpdateCategoryCommand>();

            // Domain -> Response
            CreateMap<Category, CategoryResponse>();
        }
    }
}
