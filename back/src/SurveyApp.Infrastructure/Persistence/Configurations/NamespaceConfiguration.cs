using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class NamespaceConfiguration : IEntityTypeConfiguration<Namespace>
{
    public void Configure(EntityTypeBuilder<Namespace> builder)
    {
        builder.ToTable("namespaces", DbSchemas.Core);

        builder.HasKey(n => n.Id);

        builder.Property(n => n.Name).IsRequired().HasMaxLength(100);

        builder.Property(n => n.Slug).IsRequired().HasMaxLength(50);
        builder.HasIndex(n => n.Slug).IsUnique();

        builder.Property(n => n.Description).HasMaxLength(500);

        builder.Property(n => n.LogoUrl).HasMaxLength(500);

        builder.Property(n => n.SubscriptionTier).IsRequired();

        builder.Property(n => n.MaxSurveys).IsRequired().HasDefaultValue(10);
        builder.Property(n => n.MaxUsers).IsRequired().HasDefaultValue(10);
        builder.Property(n => n.IsActive).IsRequired().HasDefaultValue(true);

        // Audit fields
        builder.Property(n => n.CreatedAt).IsRequired();
        builder.Property(n => n.CreatedBy);
        builder.Property(n => n.UpdatedAt);
        builder.Property(n => n.UpdatedBy);
        builder.Property(n => n.DeletedAt);
        builder.Property(n => n.DeletedBy);
        builder.Property(n => n.IsDeleted).IsRequired().HasDefaultValue(false);

        // Relationships
        builder
            .HasMany(n => n.Memberships)
            .WithOne(m => m.Namespace)
            .HasForeignKey(m => m.NamespaceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasMany(n => n.Surveys)
            .WithOne(s => s.Namespace)
            .HasForeignKey(s => s.NamespaceId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(n => n.CreatedAt);
        builder.HasIndex(n => n.IsDeleted);
    }
}
