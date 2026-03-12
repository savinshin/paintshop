using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaintShopBackEnd.Domain.Entities;

namespace PaintShopBackEnd.Infrastructure.Data.Configurations
{
    public class ProductConfiguration : IEntityTypeConfiguration<Product>
    {
        public void Configure(EntityTypeBuilder<Product> b)
        {
            b.HasKey(x => x.Id);

            b.Property(x => x.Id).HasMaxLength(50);
            b.Property(x => x.Sku).IsRequired().HasMaxLength(64);
            b.Property(x => x.Name).IsRequired().HasMaxLength(256);
            b.Property(x => x.Brand).IsRequired().HasMaxLength(128);
            b.Property(x => x.Finish).HasMaxLength(64);
            b.Property(x => x.Price).HasPrecision(18, 2);
            b.Property(x => x.Currency).HasMaxLength(8);
            b.Property(x => x.Hex).HasMaxLength(16);
            b.Property(x => x.ImageUrl).HasMaxLength(1024);

            b.HasIndex(x => x.Sku).IsUnique(); // уникальный SKU

            b.Property(x => x.CreatedAt)
                .HasDefaultValueSql("now() at time zone 'utc'")
                .IsRequired();
        }
    }
}
