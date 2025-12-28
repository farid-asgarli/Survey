using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class SurveyThemeConfiguration : IEntityTypeConfiguration<SurveyTheme>
{
    public void Configure(EntityTypeBuilder<SurveyTheme> builder)
    {
        builder.ToTable("SurveyThemes");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);

        builder.Property(x => x.Description).HasMaxLength(500);

        builder.Property(x => x.NamespaceId).IsRequired();

        builder.Property(x => x.IsDefault).IsRequired().HasDefaultValue(false);

        builder.Property(x => x.IsPublic).IsRequired().HasDefaultValue(true);

        // Colors
        builder
            .Property(x => x.PrimaryColor)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("#3B82F6");

        builder.Property(x => x.SecondaryColor).HasMaxLength(20).HasDefaultValue("#64748B");

        builder.Property(x => x.BackgroundColor).HasMaxLength(20).HasDefaultValue("#FFFFFF");

        builder.Property(x => x.TextColor).HasMaxLength(20).HasDefaultValue("#1F2937");

        builder.Property(x => x.AccentColor).HasMaxLength(20).HasDefaultValue("#8B5CF6");

        builder.Property(x => x.ErrorColor).HasMaxLength(20).HasDefaultValue("#EF4444");

        builder.Property(x => x.SuccessColor).HasMaxLength(20).HasDefaultValue("#22C55E");

        // Typography
        builder.Property(x => x.FontFamily).HasMaxLength(100).HasDefaultValue("Inter");

        builder.Property(x => x.HeadingFontFamily).HasMaxLength(100).HasDefaultValue("Inter");

        builder.Property(x => x.BaseFontSize).HasDefaultValue(16);

        // Layout
        builder
            .Property(x => x.Layout)
            .IsRequired()
            .HasDefaultValue(ThemeLayout.Classic)
            .HasConversion<string>();

        builder.Property(x => x.BackgroundImageUrl).HasMaxLength(500);

        builder
            .Property(x => x.BackgroundPosition)
            .IsRequired()
            .HasDefaultValue(BackgroundImagePosition.Cover)
            .HasConversion<string>();

        builder.Property(x => x.ShowProgressBar).IsRequired().HasDefaultValue(true);

        builder
            .Property(x => x.ProgressBarStyle)
            .IsRequired()
            .HasDefaultValue(ProgressBarStyle.Bar)
            .HasConversion<string>();

        // Branding
        builder.Property(x => x.LogoUrl).HasMaxLength(500);

        builder
            .Property(x => x.LogoPosition)
            .IsRequired()
            .HasDefaultValue(LogoPosition.TopLeft)
            .HasConversion<string>();

        builder.Property(x => x.ShowPoweredBy).IsRequired().HasDefaultValue(true);

        // Button styling
        builder
            .Property(x => x.ButtonStyle)
            .IsRequired()
            .HasDefaultValue(ButtonStyle.Rounded)
            .HasConversion<string>();

        builder.Property(x => x.ButtonTextColor).HasMaxLength(20).HasDefaultValue("#FFFFFF");

        // Custom CSS
        builder.Property(x => x.CustomCss).HasMaxLength(50000);

        // Usage tracking
        builder.Property(x => x.UsageCount).IsRequired().HasDefaultValue(0);

        // Soft delete
        builder.Property(x => x.IsDeleted).IsRequired().HasDefaultValue(false);

        builder.HasQueryFilter(x => !x.IsDeleted);

        // Indexes
        builder.HasIndex(x => x.NamespaceId);
        builder.HasIndex(x => new { x.NamespaceId, x.IsDefault });
        builder.HasIndex(x => x.IsPublic);
        builder.HasIndex(x => x.IsDeleted);

        // Relationships
        builder
            .HasOne(x => x.Namespace)
            .WithMany()
            .HasForeignKey(x => x.NamespaceId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
