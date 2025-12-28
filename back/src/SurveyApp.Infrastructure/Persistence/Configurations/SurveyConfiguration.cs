using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class SurveyConfiguration : IEntityTypeConfiguration<Survey>
{
    public void Configure(EntityTypeBuilder<Survey> builder)
    {
        builder.ToTable("Surveys");

        builder.HasKey(s => s.Id);

        // Ignore computed properties that are resolved from translations
        builder.Ignore(s => s.Title);
        builder.Ignore(s => s.Description);
        builder.Ignore(s => s.WelcomeMessage);
        builder.Ignore(s => s.ThankYouMessage);

        builder
            .Property(s => s.Type)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30)
            .HasDefaultValue(Domain.Enums.SurveyType.Classic);

        builder.Property(s => s.CxMetricType).HasConversion<string>().HasMaxLength(20);

        builder.Property(s => s.Status).IsRequired().HasConversion<string>().HasMaxLength(20);

        builder.Property(s => s.AccessToken).HasMaxLength(100);

        builder.Property(s => s.AllowAnonymousResponses).IsRequired().HasDefaultValue(false);
        builder.Property(s => s.AllowMultipleResponses).IsRequired().HasDefaultValue(false);

        builder.Property(s => s.MaxResponses);

        builder.Property(s => s.StartsAt);
        builder.Property(s => s.EndsAt);
        builder.Property(s => s.PublishedAt);
        builder.Property(s => s.ClosedAt);

        // Localization
        builder
            .Property(s => s.DefaultLanguage)
            .IsRequired()
            .HasMaxLength(10)
            .HasDefaultValue("en");

        // Audit fields
        builder.Property(s => s.CreatedAt).IsRequired();
        builder.Property(s => s.CreatedBy);
        builder.Property(s => s.UpdatedAt);
        builder.Property(s => s.UpdatedBy);
        builder.Property(s => s.DeletedAt);
        builder.Property(s => s.DeletedBy);
        builder.Property(s => s.IsDeleted).IsRequired().HasDefaultValue(false);

        // Relationships - configure backing field for proper change tracking
        builder
            .HasMany(s => s.Questions)
            .WithOne(q => q.Survey)
            .HasForeignKey(q => q.SurveyId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure EF Core to use the backing field for Questions collection
        builder.Navigation(s => s.Questions).UsePropertyAccessMode(PropertyAccessMode.Field);

        builder
            .HasMany(s => s.Responses)
            .WithOne(r => r.Survey)
            .HasForeignKey(r => r.SurveyId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure EF Core to use the backing field for Responses collection
        builder.Navigation(s => s.Responses).UsePropertyAccessMode(PropertyAccessMode.Field);

        // Translations relationship
        builder
            .HasMany(s => s.Translations)
            .WithOne(t => t.Survey)
            .HasForeignKey(t => t.SurveyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(s => s.Translations).UsePropertyAccessMode(PropertyAccessMode.Field);

        // Theme relationships
        // PresetThemeId stores preset identifiers like "midnight", "ocean"
        builder.Property(s => s.PresetThemeId).HasMaxLength(50);

        // Theme customizations stored as JSON
        builder.Property(s => s.ThemeCustomizations).HasColumnType("jsonb");

        // Foreign key to saved custom themes
        builder
            .HasOne(s => s.Theme)
            .WithMany()
            .HasForeignKey(s => s.ThemeId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(s => s.NamespaceId);
        builder.HasIndex(s => s.Type);
        builder.HasIndex(s => s.Status);
        builder.HasIndex(s => s.AccessToken).IsUnique();
        builder.HasIndex(s => s.CreatedAt);
        builder.HasIndex(s => s.IsDeleted);
        builder.HasIndex(s => s.ThemeId);
        builder.HasIndex(s => s.PresetThemeId);
    }
}
