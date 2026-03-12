using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PaintShopBackEnd.Domain.Entities;

namespace PaintShopBackEnd.Infrastructure.Data.Configurations
{
    public class CategoryConfiguration : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> b)
        {
            b.ToTable("Categories");

            b.HasKey(x => x.Id);

            b.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(256);

            b.Property(x => x.Slug)
                .IsRequired()
                .HasMaxLength(256);

            b.Property(x => x.SortOrder)
                .HasDefaultValue(0);

            b.Property(x => x.IsActive)
                .HasDefaultValue(true);

            b.HasOne(x => x.Parent)
                .WithMany(x => x.Children)
                .HasForeignKey(x => x.ParentId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasIndex(x => x.Slug)
                .IsUnique();
        }
    }
}
