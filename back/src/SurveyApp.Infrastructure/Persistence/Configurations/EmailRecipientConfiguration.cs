using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class EmailRecipientConfiguration : IEntityTypeConfiguration<EmailRecipient>
{
    public void Configure(EntityTypeBuilder<EmailRecipient> builder)
    {
        builder.ToTable("email_recipients", DbSchemas.Distribution);

        builder.HasKey(x => x.Id);

        builder.Property(x => x.DistributionId).IsRequired();

        builder.Property(x => x.Email).IsRequired().HasMaxLength(320);

        builder.Property(x => x.Name).HasMaxLength(200);

        builder.Property(x => x.Status).IsRequired().HasDefaultValue(RecipientStatus.Pending);

        builder.Property(x => x.SentAt);

        builder.Property(x => x.DeliveredAt);

        builder.Property(x => x.OpenedAt);

        builder.Property(x => x.ClickedAt);

        builder.Property(x => x.UniqueToken).IsRequired().HasMaxLength(50);

        builder.Property(x => x.ErrorMessage).HasMaxLength(1000);

        builder.Property(x => x.OpenCount).IsRequired().HasDefaultValue(0);

        builder.Property(x => x.ClickCount).IsRequired().HasDefaultValue(0);

        // Audit fields
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.CreatedBy);
        builder.Property(x => x.UpdatedAt);
        builder.Property(x => x.UpdatedBy);
        builder.Property(x => x.IsDeleted).IsRequired().HasDefaultValue(false);
        builder.Property(x => x.DeletedAt);
        builder.Property(x => x.DeletedBy);

        // Indexes
        builder.HasIndex(x => x.DistributionId);
        builder.HasIndex(x => x.UniqueToken).IsUnique();
        builder.HasIndex(x => x.Email);
        builder.HasIndex(x => x.Status);
    }
}
