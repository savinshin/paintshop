using FluentValidation;
using PaintShopBackEnd.Domain.Interfaces;
using PaintShopBackEnd.WebApi.Models.Products;

namespace PaintShopBackEnd.WebApi.Validation.Products;

public sealed class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductRequestValidator(ICategoryRepository categories)
    {
        RuleFor(x => x.sku).NotEmpty().WithMessage("Поле обязательно для заполнения.")
            .Must(v => v == null || v.Trim().Length <= 64).WithMessage("Артикул: не более 64 символов.");
        RuleFor(x => x.name).NotEmpty().WithMessage("Поле обязательно для заполнения.")
            .Must(v => v == null || v.Trim().Length <= 256).WithMessage("Название: не более 256 символов.");
        RuleFor(x => x.brand).NotEmpty().WithMessage("Поле обязательно для заполнения.")
            .Must(v => v == null || v.Trim().Length <= 128).WithMessage("Бренд: не более 128 символов.");
        RuleFor(x => x.finish).MaximumLength(64).WithMessage("Не более 64 символов.");
        RuleFor(x => x.currency).MaximumLength(8).WithMessage("Не более 8 символов.");
        RuleFor(x => x.hex).MaximumLength(16).WithMessage("Не более 16 символов.");
        RuleFor(x => x.imageUrl).MaximumLength(1024).WithMessage("Не более 1024 символов.");
        RuleFor(x => x.price).InclusiveBetween(0m, 999999999.99m)
            .WithMessage("Цена должна быть от 0 до 999999999,99.")
            .PrecisionScale(11, 2, false).WithMessage("Цена должна содержать не более двух знаков после запятой.");
        RuleFor(x => x.stockQty).GreaterThanOrEqualTo(0).WithMessage("Количество не может быть отрицательным.");
        RuleFor(x => x.packageMl).GreaterThan(0).WithMessage("Объём должен быть больше нуля.");
        RuleFor(x => x.categoryIds).Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage("Выберите хотя бы одну категорию.")
            .Must(ids => ids.Distinct().Count() == ids.Count).WithMessage("Категории не должны повторяться.")
            .MustAsync((ids, cancellationToken) => categories.AllExistAsync(ids, cancellationToken))
            .WithMessage("Одна или несколько категорий не существуют.");
        RuleForEach(x => x.categoryIds).GreaterThan(0).WithMessage("Идентификатор категории должен быть положительным.");
    }
}
