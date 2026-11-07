namespace PaintShopBackEnd.Domain.Exceptions;

public sealed class DuplicateSkuException : Exception
{
    public DuplicateSkuException(Exception innerException) : base("SKU already exists.", innerException) { }
}
