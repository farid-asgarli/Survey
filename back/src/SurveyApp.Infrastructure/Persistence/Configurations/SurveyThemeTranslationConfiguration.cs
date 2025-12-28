using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class SurveyThemeTranslationConfiguration : IEntityTypeConfiguration<SurveyThemeTranslation>
{
    public void Configure(EntityTypeBuilder<SurveyThemeTranslation> builder)
    {
        builder.ToTable("SurveyThemeTranslations");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.LanguageCode).IsRequired().HasMaxLength(10);

        builder.Property(t => t.IsDefault).IsRequired().HasDefaultValue(false);

        builder.Property(t => t.Name).IsRequired().HasMaxLength(200);

        builder.Property(t => t.Description).HasMaxLength(1000);

        builder.Property(t => t.LastModifiedAt);
        builder.Property(t => t.LastModifiedBy);

        // Relationship
        builder
            .HasOne(t => t.Theme)
            .WithMany()
            .HasForeignKey(t => t.ThemeId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(t => t.ThemeId);
        builder.HasIndex(t => new { t.ThemeId, t.LanguageCode }).IsUnique();
        builder.HasIndex(t => t.LanguageCode);
    }
}
