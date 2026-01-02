using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class EmailDistributionConfiguration : IEntityTypeConfiguration<EmailDistribution>
{
    public void Configure(EntityTypeBuilder<EmailDistribution> builder)
    {
        builder.ToTable("email_distributions", DbSchemas.Distribution);

        builder.HasKey(x => x.Id);

        builder.Property(x => x.SurveyId).IsRequired();

        builder.Property(x => x.NamespaceId).IsRequired();

        builder.Property(x => x.EmailTemplateId);

        builder.Property(x => x.Subject).IsRequired().HasMaxLength(500);

        builder.Property(x => x.Body).IsRequired();

        builder.Property(x => x.SenderName).HasMaxLength(200);

        builder.Property(x => x.SenderEmail).HasMaxLength(320);

        builder.Property(x => x.ScheduledAt);

        builder.Property(x => x.SentAt);

        builder.Property(x => x.Status).IsRequired().HasDefaultValue(DistributionStatus.Draft);

        builder.Property(x => x.TotalRecipients).IsRequired().HasDefaultValue(0);

        builder.Property(x => x.SentCount).IsRequired().HasDefaultValue(0);

        builder.Property(x => x.DeliveredCount).IsRequired().HasDefaultValue(0);

        builder.Property(x => x.OpenedCount).IsRequired().HasDefaultValue(0);

        builder.Property(x => x.ClickedCount).IsRequired().HasDefaultValue(0);

        builder.Property(x => x.BouncedCount).IsRequired().HasDefaultValue(0);

        builder.Property(x => x.UnsubscribedCount).IsRequired().HasDefaultValue(0);

        // Audit fields
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.CreatedBy);
        builder.Property(x => x.UpdatedAt);
        builder.Property(x => x.UpdatedBy);
        builder.Property(x => x.IsDeleted).IsRequired().HasDefaultValue(false);
        builder.Property(x => x.DeletedAt);
        builder.Property(x => x.DeletedBy);

        // Relationships
        builder
            .HasOne(x => x.Survey)
            .WithMany()
            .HasForeignKey(x => x.SurveyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(x => x.EmailTemplate)
            .WithMany()
            .HasForeignKey(x => x.EmailTemplateId)
            .OnDelete(DeleteBehavior.SetNull);

        builder
            .HasMany(x => x.Recipients)
            .WithOne(x => x.Distribution)
            .HasForeignKey(x => x.DistributionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.SurveyId);
        builder.HasIndex(x => x.NamespaceId);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.ScheduledAt).HasFilter("\"Status\" = 1"); // 1 = DistributionStatus.Scheduled
    }
}
