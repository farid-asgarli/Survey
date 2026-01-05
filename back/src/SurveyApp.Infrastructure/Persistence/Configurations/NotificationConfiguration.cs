using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications", DbSchemas.Core);

        builder.HasKey(n => n.Id);

        builder.Property(n => n.UserId).IsRequired();

        builder.Property(n => n.Type).IsRequired().HasConversion<string>().HasMaxLength(50);

        builder.Property(n => n.Title).IsRequired().HasMaxLength(200);

        builder.Property(n => n.Message).IsRequired().HasMaxLength(1000);

        builder.Property(n => n.ActionUrl).HasMaxLength(500);

        builder.Property(n => n.ActionLabel).HasMaxLength(100);

        builder.Property(n => n.IsRead).IsRequired().HasDefaultValue(false);

        builder.Property(n => n.ReadAt);

        builder.Property(n => n.Metadata).HasColumnType("jsonb");

        builder.Property(n => n.RelatedEntityId);

        builder.Property(n => n.RelatedEntityType).HasMaxLength(50);

        builder.Property(n => n.IsArchived).IsRequired().HasDefaultValue(false);

        // Audit fields
        builder.Property(n => n.CreatedAt).IsRequired();
        builder.Property(n => n.CreatedBy);
        builder.Property(n => n.UpdatedAt);
        builder.Property(n => n.UpdatedBy);

        // Relationships
        builder
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes for performance
        builder.HasIndex(n => n.UserId);
        builder.HasIndex(n => new
        {
            n.UserId,
            n.IsRead,
            n.IsArchived,
        });
        builder.HasIndex(n => new { n.UserId, n.CreatedAt });
        builder.HasIndex(n => n.Type);
    }
}
