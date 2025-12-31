using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class EmailTemplateTranslationConfiguration
    : IEntityTypeConfiguration<EmailTemplateTranslation>
{
    public void Configure(EntityTypeBuilder<EmailTemplateTranslation> builder)
    {
        builder.ToTable("EmailTemplateTranslations");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.LanguageCode).IsRequired().HasMaxLength(10);

        builder.Property(t => t.IsDefault).IsRequired().HasDefaultValue(false);

        builder.Property(t => t.Name).IsRequired().HasMaxLength(200);

        builder.Property(t => t.Subject).IsRequired().HasMaxLength(500);

        builder.Property(t => t.HtmlBody).IsRequired();

        builder.Property(t => t.PlainTextBody);

        builder.Property(t => t.DesignJson).HasColumnType("jsonb");

        builder.Property(t => t.LastModifiedAt);
        builder.Property(t => t.LastModifiedBy);

        // Note: Concurrency control is handled at the parent entity level
        // Translations don't need separate concurrency tokens
        builder.Ignore(t => t.Version);

        // Apply matching query filter to match parent entity's soft delete filter
        builder.HasQueryFilter(t => !t.EmailTemplate.IsDeleted);

        // Note: Relationship is configured in EmailTemplateConfiguration (parent side)

        // Indexes
        builder.HasIndex(t => t.EmailTemplateId);
        builder.HasIndex(t => new { t.EmailTemplateId, t.LanguageCode }).IsUnique();
        builder.HasIndex(t => t.LanguageCode);
    }
}
