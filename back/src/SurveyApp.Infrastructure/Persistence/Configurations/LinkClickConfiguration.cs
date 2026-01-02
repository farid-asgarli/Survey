using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for LinkClick.
/// </summary>
public class LinkClickConfiguration : IEntityTypeConfiguration<LinkClick>
{
    public void Configure(EntityTypeBuilder<LinkClick> builder)
    {
        builder.ToTable("link_clicks", DbSchemas.Distribution);

        builder.HasKey(c => c.Id);

        builder.Property(c => c.ClickedAt).IsRequired();

        builder.Property(c => c.IpAddress).HasMaxLength(50);

        builder.Property(c => c.UserAgent).HasMaxLength(500);

        builder.Property(c => c.Referrer).HasMaxLength(500);

        builder.Property(c => c.Country).HasMaxLength(100);

        builder.Property(c => c.City).HasMaxLength(100);

        builder.Property(c => c.DeviceType).HasMaxLength(20);

        builder.Property(c => c.Browser).HasMaxLength(50);

        builder.Property(c => c.OperatingSystem).HasMaxLength(50);

        builder.Property(c => c.ResponseId);

        // Audit fields
        builder.Property(c => c.CreatedAt).IsRequired();
        builder.Property(c => c.CreatedBy);
        builder.Property(c => c.UpdatedAt);
        builder.Property(c => c.UpdatedBy);
        builder.Property(c => c.DeletedAt);
        builder.Property(c => c.DeletedBy);
        builder.Property(c => c.IsDeleted).IsRequired().HasDefaultValue(false);

        // Relationships
        builder
            .HasOne(c => c.SurveyLink)
            .WithMany(l => l.Clicks)
            .HasForeignKey(c => c.SurveyLinkId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(c => c.Response)
            .WithMany()
            .HasForeignKey(c => c.ResponseId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(c => c.SurveyLinkId);
        builder.HasIndex(c => c.ClickedAt);
        builder.HasIndex(c => c.ResponseId);
        builder.HasIndex(c => c.IsDeleted);
    }
}
