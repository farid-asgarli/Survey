using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

/// <summary>
/// EF Core configuration for RecurringSurveyRun entity.
/// </summary>
public class RecurringSurveyRunConfiguration : IEntityTypeConfiguration<RecurringSurveyRun>
{
    public void Configure(EntityTypeBuilder<RecurringSurveyRun> builder)
    {
        builder.ToTable("recurring_survey_runs", DbSchemas.Scheduling);

        builder.HasKey(r => r.Id);

        builder.Property(r => r.RunNumber).IsRequired();

        builder.Property(r => r.ScheduledAt).IsRequired();

        builder.Property(r => r.StartedAt);

        builder.Property(r => r.CompletedAt);

        builder.Property(r => r.Status).IsRequired();

        builder.Property(r => r.RecipientsCount).HasDefaultValue(0);

        builder.Property(r => r.SentCount).HasDefaultValue(0);

        builder.Property(r => r.FailedCount).HasDefaultValue(0);

        builder.Property(r => r.ResponsesCount).HasDefaultValue(0);

        builder.Property(r => r.ErrorMessage).HasMaxLength(2000);

        builder.Property(r => r.DurationMs).HasDefaultValue(0);

        // Audit fields
        builder.Property(r => r.CreatedAt).IsRequired();
        builder.Property(r => r.CreatedBy);
        builder.Property(r => r.UpdatedAt);
        builder.Property(r => r.UpdatedBy);
        builder.Property(r => r.DeletedAt);
        builder.Property(r => r.DeletedBy);
        builder.Property(r => r.IsDeleted).IsRequired().HasDefaultValue(false);

        // Indexes
        builder.HasIndex(r => r.RecurringSurveyId);
        builder.HasIndex(r => r.ScheduledAt);
        builder.HasIndex(r => r.Status);
        builder.HasIndex(r => r.IsDeleted);
    }
}
