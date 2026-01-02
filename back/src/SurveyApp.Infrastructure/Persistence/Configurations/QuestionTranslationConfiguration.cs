using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class QuestionTranslationConfiguration : IEntityTypeConfiguration<QuestionTranslation>
{
    public void Configure(EntityTypeBuilder<QuestionTranslation> builder)
    {
        builder.ToTable("question_translations", DbSchemas.I18n);

        builder.HasKey(t => t.Id);

        builder.Property(t => t.LanguageCode).IsRequired().HasMaxLength(10);

        builder.Property(t => t.IsDefault).IsRequired().HasDefaultValue(false);

        builder.Property(t => t.Text).IsRequired().HasMaxLength(2000);

        builder.Property(t => t.Description).HasMaxLength(2000);

        builder.Property(t => t.TranslatedSettingsJson).HasColumnType("jsonb");

        builder.Property(t => t.LastModifiedAt);
        builder.Property(t => t.LastModifiedBy);

        // Note: Concurrency control is handled at the parent entity level
        // Translations don't need separate concurrency tokens
        builder.Ignore(t => t.Version);

        // Apply matching query filter to match parent entity's soft delete filter
        builder.HasQueryFilter(t => !t.Question.IsDeleted);

        // Relationship
        builder
            .HasOne(t => t.Question)
            .WithMany(q => q.Translations)
            .HasForeignKey(t => t.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(t => t.QuestionId);
        builder.HasIndex(t => new { t.QuestionId, t.LanguageCode }).IsUnique();
        builder.HasIndex(t => t.LanguageCode);
    }
}
