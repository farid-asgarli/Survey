using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class TemplateQuestionConfiguration : IEntityTypeConfiguration<TemplateQuestion>
{
    public void Configure(EntityTypeBuilder<TemplateQuestion> builder)
    {
        builder.ToTable("TemplateQuestions");

        builder.HasKey(q => q.Id);

        // Ignore computed properties (resolved from translations)
        builder.Ignore(q => q.Text);
        builder.Ignore(q => q.Description);

        // Default language for translations
        builder
            .Property(q => q.DefaultLanguage)
            .IsRequired()
            .HasMaxLength(10)
            .HasDefaultValue("en");

        builder.Property(q => q.Type).IsRequired().HasConversion<string>().HasMaxLength(30);

        builder.Property(q => q.Order).IsRequired();

        builder.Property(q => q.IsRequired).IsRequired().HasDefaultValue(false);

        builder.Property(q => q.SettingsJson).HasColumnType("jsonb");

        // Audit fields
        builder.Property(q => q.CreatedAt).IsRequired();
        builder.Property(q => q.CreatedBy);
        builder.Property(q => q.UpdatedAt);
        builder.Property(q => q.UpdatedBy);
        builder.Property(q => q.DeletedAt);
        builder.Property(q => q.DeletedBy);
        builder.Property(q => q.IsDeleted).IsRequired().HasDefaultValue(false);

        // Indexes
        builder.HasIndex(q => q.TemplateId);
        builder.HasIndex(q => new { q.TemplateId, q.Order });
        builder.HasIndex(q => q.IsDeleted);

        // Translations relationship - configure from parent side
        builder
            .HasMany(q => q.Translations)
            .WithOne(t => t.TemplateQuestion)
            .HasForeignKey(t => t.TemplateQuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(q => q.Translations).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
