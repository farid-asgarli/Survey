using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class SurveyCategoryConfiguration : IEntityTypeConfiguration<SurveyCategory>
{
    public void Configure(EntityTypeBuilder<SurveyCategory> builder)
    {
        builder.ToTable("survey_categories", DbSchemas.Survey);

        builder.HasKey(x => x.Id);

        // Ignore computed properties (resolved from translations)
        builder.Ignore(x => x.Name);
        builder.Ignore(x => x.Description);

        builder.Property(x => x.NamespaceId).IsRequired();

        builder
            .Property(x => x.DefaultLanguage)
            .IsRequired()
            .HasMaxLength(10)
            .HasDefaultValue("en");

        builder.Property(x => x.Color).HasMaxLength(20);

        builder.Property(x => x.Icon).HasMaxLength(100);

        builder.Property(x => x.DisplayOrder).IsRequired().HasDefaultValue(0);

        builder.Property(x => x.IsDefault).IsRequired().HasDefaultValue(false);

        // Audit fields
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.CreatedBy);
        builder.Property(x => x.UpdatedAt);
        builder.Property(x => x.UpdatedBy);
        builder.Property(x => x.DeletedAt);
        builder.Property(x => x.DeletedBy);
        builder.Property(x => x.IsDeleted).IsRequired().HasDefaultValue(false);

        builder.HasQueryFilter(x => !x.IsDeleted);

        // Indexes
        builder.HasIndex(x => x.NamespaceId);
        builder.HasIndex(x => new { x.NamespaceId, x.IsDefault });
        builder.HasIndex(x => new { x.NamespaceId, x.DisplayOrder });
        builder.HasIndex(x => x.IsDeleted);

        // Relationships
        builder
            .HasOne(x => x.Namespace)
            .WithMany()
            .HasForeignKey(x => x.NamespaceId)
            .OnDelete(DeleteBehavior.Restrict);

        // Translations relationship - configure from parent side
        builder
            .HasMany(x => x.Translations)
            .WithOne(t => t.Category)
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(x => x.Translations).UsePropertyAccessMode(PropertyAccessMode.Field);

        // Surveys relationship - configure from parent side
        builder
            .HasMany(x => x.Surveys)
            .WithOne(s => s.Category)
            .HasForeignKey(s => s.CategoryId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Navigation(x => x.Surveys).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
