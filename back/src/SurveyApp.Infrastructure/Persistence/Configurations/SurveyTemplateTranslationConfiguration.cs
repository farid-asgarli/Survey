using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class SurveyTemplateTranslationConfiguration
    : IEntityTypeConfiguration<SurveyTemplateTranslation>
{
    public void Configure(EntityTypeBuilder<SurveyTemplateTranslation> builder)
    {
        builder.ToTable("SurveyTemplateTranslations");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.LanguageCode).IsRequired().HasMaxLength(10);

        builder.Property(t => t.IsDefault).IsRequired().HasDefaultValue(false);

        builder.Property(t => t.Name).IsRequired().HasMaxLength(200);

        builder.Property(t => t.Description).HasMaxLength(2000);

        builder.Property(t => t.Category).HasMaxLength(100);

        builder.Property(t => t.WelcomeMessage).HasMaxLength(2000);

        builder.Property(t => t.ThankYouMessage).HasMaxLength(2000);

        builder.Property(t => t.LastModifiedAt);
        builder.Property(t => t.LastModifiedBy);

        // Note: Relationship is configured in SurveyTemplateConfiguration (parent side)

        // Indexes
        builder.HasIndex(t => t.TemplateId);
        builder.HasIndex(t => new { t.TemplateId, t.LanguageCode }).IsUnique();
        builder.HasIndex(t => t.LanguageCode);
    }
}
