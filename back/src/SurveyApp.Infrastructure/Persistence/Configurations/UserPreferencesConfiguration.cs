using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class UserPreferencesConfiguration : IEntityTypeConfiguration<UserPreferences>
{
    public void Configure(EntityTypeBuilder<UserPreferences> builder)
    {
        builder.ToTable("UserPreferences");

        builder.HasKey(up => up.Id);

        // User relationship - one-to-one
        builder.HasIndex(up => up.UserId).IsUnique();
        builder
            .HasOne(up => up.User)
            .WithOne()
            .HasForeignKey<UserPreferences>(up => up.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Appearance settings
        builder
            .Property(up => up.ThemeMode)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("system");

        builder
            .Property(up => up.ColorPalette)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("purple");

        // Accessibility settings
        builder.Property(up => up.HighContrastMode).IsRequired().HasDefaultValue(false);

        builder.Property(up => up.ReducedMotion).IsRequired().HasDefaultValue(false);

        builder.Property(up => up.ScreenReaderOptimized).IsRequired().HasDefaultValue(false);

        builder
            .Property(up => up.FontSizeScale)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("medium");

        builder.Property(up => up.DyslexiaFriendlyFont).IsRequired().HasDefaultValue(false);

        // Language & Regional settings
        builder.Property(up => up.Language).IsRequired().HasMaxLength(10).HasDefaultValue("en");

        builder
            .Property(up => up.DateFormat)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("MM/DD/YYYY");

        builder.Property(up => up.TimeFormat).IsRequired().HasMaxLength(10).HasDefaultValue("12h");

        builder.Property(up => up.Timezone).IsRequired().HasMaxLength(100).HasDefaultValue("UTC");

        builder
            .Property(up => up.DecimalSeparator)
            .IsRequired()
            .HasMaxLength(10)
            .HasDefaultValue("dot");

        builder
            .Property(up => up.ThousandsSeparator)
            .IsRequired()
            .HasMaxLength(10)
            .HasDefaultValue("comma");

        // Notification settings
        builder.Property(up => up.EmailNotifications).IsRequired().HasDefaultValue(true);

        builder.Property(up => up.ResponseAlerts).IsRequired().HasDefaultValue(true);

        builder.Property(up => up.WeeklyDigest).IsRequired().HasDefaultValue(false);

        builder.Property(up => up.MarketingEmails).IsRequired().HasDefaultValue(false);

        builder.Property(up => up.CompletionAlerts).IsRequired().HasDefaultValue(true);

        builder.Property(up => up.DistributionReports).IsRequired().HasDefaultValue(true);

        // Dashboard & UI settings
        builder
            .Property(up => up.DefaultViewMode)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("grid");

        builder.Property(up => up.ItemsPerPage).IsRequired().HasDefaultValue(12);

        builder.Property(up => up.SidebarCollapsed).IsRequired().HasDefaultValue(false);

        builder
            .Property(up => up.DefaultSortField)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("updatedAt");

        builder
            .Property(up => up.DefaultSortOrder)
            .IsRequired()
            .HasMaxLength(10)
            .HasDefaultValue("desc");

        builder
            .Property(up => up.HomeWidgets)
            .IsRequired()
            .HasMaxLength(1000)
            .HasDefaultValue("[\"stats\",\"recent\",\"quick-actions\"]");

        builder
            .Property(up => up.PinnedSurveyIds)
            .IsRequired()
            .HasMaxLength(2000)
            .HasDefaultValue("");

        // Survey Builder settings
        builder.Property(up => up.DefaultQuestionRequired).IsRequired().HasDefaultValue(true);

        builder.Property(up => up.DefaultThemeId);

        builder
            .Property(up => up.DefaultWelcomeMessage)
            .IsRequired()
            .HasMaxLength(2000)
            .HasDefaultValue("");

        builder
            .Property(up => up.DefaultThankYouMessage)
            .IsRequired()
            .HasMaxLength(2000)
            .HasDefaultValue("");

        builder.Property(up => up.AutoSaveInterval).IsRequired().HasDefaultValue(30);

        builder
            .Property(up => up.QuestionNumberingStyle)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("numbers");

        builder.Property(up => up.ShowQuestionDescriptions).IsRequired().HasDefaultValue(true);

        builder
            .Property(up => up.DefaultPageBreakBehavior)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("auto");

        // Onboarding settings
        builder
            .Property(up => up.OnboardingStatus)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("not_started");

        builder.Property(up => up.OnboardingCompletedAt);

        builder.Property(up => up.OnboardingCurrentStep).IsRequired().HasDefaultValue(0);

        builder.Property(up => up.HasSeenWelcomeTour).IsRequired().HasDefaultValue(false);

        builder.Property(up => up.HasCompletedProfileSetup).IsRequired().HasDefaultValue(false);

        builder.Property(up => up.HasCreatedFirstSurvey).IsRequired().HasDefaultValue(false);

        // Audit fields
        builder.Property(up => up.CreatedAt).IsRequired();
        builder.Property(up => up.CreatedBy);
        builder.Property(up => up.UpdatedAt);
        builder.Property(up => up.UpdatedBy);
        builder.Property(up => up.DeletedAt);
        builder.Property(up => up.DeletedBy);
        builder.Property(up => up.IsDeleted).IsRequired().HasDefaultValue(false);
    }
}
