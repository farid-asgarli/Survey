using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class SurveyTemplateConfiguration : IEntityTypeConfiguration<SurveyTemplate>
{
    public void Configure(EntityTypeBuilder<SurveyTemplate> builder)
    {
        builder.ToTable("survey_templates", DbSchemas.Templates);

        builder.HasKey(t => t.Id);

        // Ignore computed properties (resolved from translations)
        builder.Ignore(t => t.Name);
        builder.Ignore(t => t.Description);
        builder.Ignore(t => t.Category);
        builder.Ignore(t => t.WelcomeMessage);
        builder.Ignore(t => t.ThankYouMessage);

        // Default language for translations
        builder
            .Property(t => t.DefaultLanguage)
            .IsRequired()
            .HasMaxLength(10)
            .HasDefaultValue("en");

        builder.Property(t => t.IsPublic).IsRequired().HasDefaultValue(false);

        builder.Property(t => t.DefaultAllowAnonymous).IsRequired().HasDefaultValue(true);

        builder.Property(t => t.DefaultAllowMultipleResponses).IsRequired().HasDefaultValue(false);

        builder.Property(t => t.UsageCount).IsRequired().HasDefaultValue(0);

        // Audit fields
        builder.Property(t => t.CreatedAt).IsRequired();
        builder.Property(t => t.CreatedBy);
        builder.Property(t => t.UpdatedAt);
        builder.Property(t => t.UpdatedBy);
        builder.Property(t => t.DeletedAt);
        builder.Property(t => t.DeletedBy);
        builder.Property(t => t.IsDeleted).IsRequired().HasDefaultValue(false);

        // Relationships
        builder
            .HasMany(t => t.Questions)
            .WithOne(q => q.Template)
            .HasForeignKey(q => q.TemplateId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(t => t.Namespace)
            .WithMany()
            .HasForeignKey(t => t.NamespaceId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(t => t.NamespaceId);
        // Note: Category and Name indexes removed - these are now computed properties from translations
        // To search by Category/Name, query through SurveyTemplateTranslations table
        builder.HasIndex(t => t.IsPublic);
        builder.HasIndex(t => t.CreatedAt);
        builder.HasIndex(t => t.IsDeleted);

        // Translations relationship - configure from parent side
        builder
            .HasMany(t => t.Translations)
            .WithOne(tr => tr.Template)
            .HasForeignKey(tr => tr.TemplateId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(t => t.Translations).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
