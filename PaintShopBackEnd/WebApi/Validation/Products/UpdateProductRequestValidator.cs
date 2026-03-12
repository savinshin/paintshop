using FluentValidation;
using PaintShopBackEnd.WebApi.Models.Products;

namespace PaintShopBackEnd.WebApi.Validation.Products;

public class UpdateProductRequestValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductRequestValidator()
    {
        RuleFor(x => x.sku).NotEmpty().MaximumLength(64);
        RuleFor(x => x.name).NotEmpty().MaximumLength(256);
        RuleFor(x => x.brand).NotEmpty().MaximumLength(128);

        RuleFor(x => x.categoryIds).NotNull();
        RuleForEach(x => x.categoryIds).GreaterThan(0);

        RuleFor(x => x.categoryIds)
            .Must(ids => ids != null && ids.Distinct().Count() == ids.Count)
            .WithMessage("categoryIds must be unique");
    }
}
