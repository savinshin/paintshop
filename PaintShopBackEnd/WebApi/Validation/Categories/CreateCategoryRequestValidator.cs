using FluentValidation;
using PaintShopBackEnd.WebApi.Models.Categories;

namespace PaintShopBackEnd.WebApi.Validation.Categories;

public sealed class CreateCategoryRequestValidator : AbstractValidator<CreateCategoryRequest>
{
    public CreateCategoryRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Slug).MaximumLength(256);
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ParentId).GreaterThan(0).When(x => x.ParentId.HasValue);
    }
}
