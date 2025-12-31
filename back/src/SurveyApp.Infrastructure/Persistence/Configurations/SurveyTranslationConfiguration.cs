using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class SurveyTranslationConfiguration : IEntityTypeConfiguration<SurveyTranslation>
{
    public void Configure(EntityTypeBuilder<SurveyTranslation> builder)
    {
        builder.ToTable("SurveyTranslations");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.LanguageCode).IsRequired().HasMaxLength(10);

        builder.Property(t => t.IsDefault).IsRequired().HasDefaultValue(false);

        builder.Property(t => t.Title).IsRequired().HasMaxLength(500);

        builder.Property(t => t.Description).HasMaxLength(2000);

        builder.Property(t => t.WelcomeMessage).HasMaxLength(2000);

        builder.Property(t => t.ThankYouMessage).HasMaxLength(2000);

        builder.Property(t => t.LastModifiedAt);
        builder.Property(t => t.LastModifiedBy);

        // Note: Concurrency control is handled at the parent Survey entity level
        // Translations don't need separate concurrency tokens
        builder.Ignore(t => t.Version);

        // Apply matching query filter to match parent entity's soft delete filter
        builder.HasQueryFilter(t => !t.Survey.IsDeleted);

        // Relationship
        builder
            .HasOne(t => t.Survey)
            .WithMany(s => s.Translations)
            .HasForeignKey(t => t.SurveyId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(t => t.SurveyId);
        builder.HasIndex(t => new { t.SurveyId, t.LanguageCode }).IsUnique();
        builder.HasIndex(t => t.LanguageCode);
    }
}
