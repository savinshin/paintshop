using AutoMapper;
using PaintShopBackEnd.Application.Commands.Categories;
using PaintShopBackEnd.Domain.Entities;

namespace PaintShopBackEnd.Application.Mappings
{
    public class CategoryMappingProfile : Profile
    {
        public CategoryMappingProfile()
        {
            CreateMap<CreateCategoryCommand, Category>();
            CreateMap<UpdateCategoryCommand, Category>();
        }
    }
}
