using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class QuestionConfiguration : IEntityTypeConfiguration<Question>
{
    public void Configure(EntityTypeBuilder<Question> builder)
    {
        builder.ToTable("Questions");

        builder.HasKey(q => q.Id);

        // Ignore computed properties that are resolved from translations
        builder.Ignore(q => q.Text);
        builder.Ignore(q => q.Description);

        builder.Property(q => q.Type).IsRequired().HasConversion<string>().HasMaxLength(30);

        builder.Property(q => q.IsRequired).IsRequired().HasDefaultValue(false);

        builder.Property(q => q.Order).IsRequired();

        builder.Property(q => q.SettingsJson).HasColumnType("jsonb");

        // NPS properties
        builder.Property(q => q.IsNpsQuestion).IsRequired().HasDefaultValue(false);

        builder.Property(q => q.NpsType).HasConversion<string>().HasMaxLength(30);

        // DefaultLanguage is computed from Survey, ignore it
        builder.Ignore(q => q.DefaultLanguage);

        // Translations relationship
        builder
            .HasMany(q => q.Translations)
            .WithOne(t => t.Question)
            .HasForeignKey(t => t.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(q => q.Translations).UsePropertyAccessMode(PropertyAccessMode.Field);

        // Audit fields
        builder.Property(q => q.CreatedAt).IsRequired();
        builder.Property(q => q.CreatedBy);
        builder.Property(q => q.UpdatedAt);
        builder.Property(q => q.UpdatedBy);
        builder.Property(q => q.DeletedAt);
        builder.Property(q => q.DeletedBy);
        builder.Property(q => q.IsDeleted).IsRequired().HasDefaultValue(false);

        // Indexes
        builder.HasIndex(q => q.SurveyId);
        builder.HasIndex(q => new { q.SurveyId, q.Order });
        builder.HasIndex(q => q.IsDeleted);
        builder.HasIndex(q => q.IsNpsQuestion);
    }
}
