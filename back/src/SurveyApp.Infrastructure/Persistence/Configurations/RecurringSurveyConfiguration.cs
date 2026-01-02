using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

/// <summary>
/// EF Core configuration for RecurringSurvey entity.
/// </summary>
public class RecurringSurveyConfiguration : IEntityTypeConfiguration<RecurringSurvey>
{
    public void Configure(EntityTypeBuilder<RecurringSurvey> builder)
    {
        builder.ToTable("recurring_surveys", DbSchemas.Scheduling);

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Name).IsRequired().HasMaxLength(200);

        builder.Property(r => r.IsActive).IsRequired().HasDefaultValue(false);

        // Schedule properties
        builder.Property(r => r.Pattern).IsRequired();

        builder.Property(r => r.CronExpression).HasMaxLength(100);

        builder.Property(r => r.SendTime).IsRequired();

        builder.Property(r => r.TimezoneId).IsRequired().HasMaxLength(100);

        builder
            .Property(r => r.DaysOfWeek)
            .HasConversion(
                v => string.Join(",", v.Select(d => (int)d)),
                v =>
                    v.Split(",", StringSplitOptions.RemoveEmptyEntries)
                        .Select(s => (DayOfWeek)int.Parse(s))
                        .ToArray()
            )
            .HasMaxLength(50)
            .Metadata.SetValueComparer(
                new ValueComparer<DayOfWeek[]>(
                    (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c.ToArray()
                )
            );

        builder.Property(r => r.DayOfMonth);

        // Audience properties
        builder.Property(r => r.AudienceType).IsRequired();

        builder
            .Property(r => r.RecipientEmails)
            .HasConversion(
                v => string.Join(";", v),
                v => v.Split(";", StringSplitOptions.RemoveEmptyEntries)
            )
            .HasMaxLength(10000)
            .Metadata.SetValueComparer(
                new ValueComparer<string[]>(
                    (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c.ToArray()
                )
            );

        builder.Property(r => r.AudienceListId);

        // Options
        builder.Property(r => r.SendReminders).IsRequired().HasDefaultValue(false);

        builder.Property(r => r.ReminderDaysAfter).HasDefaultValue(3);

        builder.Property(r => r.MaxReminders).HasDefaultValue(2);

        builder.Property(r => r.CustomSubject).HasMaxLength(200);

        builder.Property(r => r.CustomMessage).HasMaxLength(2000);

        // Tracking
        builder.Property(r => r.NextRunAt);
        builder.Property(r => r.LastRunAt);
        builder.Property(r => r.TotalRuns).HasDefaultValue(0);
        builder.Property(r => r.EndsAt);
        builder.Property(r => r.MaxRuns);

        // Audit fields
        builder.Property(r => r.CreatedAt).IsRequired();
        builder.Property(r => r.CreatedBy);
        builder.Property(r => r.UpdatedAt);
        builder.Property(r => r.UpdatedBy);
        builder.Property(r => r.DeletedAt);
        builder.Property(r => r.DeletedBy);
        builder.Property(r => r.IsDeleted).IsRequired().HasDefaultValue(false);

        // Relationships
        builder
            .HasOne(r => r.Survey)
            .WithMany()
            .HasForeignKey(r => r.SurveyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(r => r.Namespace)
            .WithMany()
            .HasForeignKey(r => r.NamespaceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasMany(r => r.Runs)
            .WithOne(run => run.RecurringSurvey)
            .HasForeignKey(run => run.RecurringSurveyId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(r => r.SurveyId);
        builder.HasIndex(r => r.NamespaceId);
        builder.HasIndex(r => r.IsActive);
        builder.HasIndex(r => r.NextRunAt);
        builder.HasIndex(r => r.IsDeleted);
    }
}
