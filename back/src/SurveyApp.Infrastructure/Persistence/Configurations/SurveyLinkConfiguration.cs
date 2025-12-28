using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for SurveyLink.
/// </summary>
public class SurveyLinkConfiguration : IEntityTypeConfiguration<SurveyLink>
{
    public void Configure(EntityTypeBuilder<SurveyLink> builder)
    {
        builder.ToTable("SurveyLinks");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.Token).IsRequired().HasMaxLength(50);

        builder.Property(l => l.Type).IsRequired().HasConversion<string>().HasMaxLength(20);

        builder.Property(l => l.Name).HasMaxLength(100);

        builder.Property(l => l.Source).HasMaxLength(100);

        builder.Property(l => l.Medium).HasMaxLength(100);

        builder.Property(l => l.Campaign).HasMaxLength(100);

        builder.Property(l => l.PrefillDataJson).HasColumnType("text");

        builder.Property(l => l.IsActive).IsRequired().HasDefaultValue(true);

        builder.Property(l => l.ExpiresAt);

        builder.Property(l => l.MaxUses);

        builder.Property(l => l.UsageCount).IsRequired().HasDefaultValue(0);

        builder.Property(l => l.ResponseCount).IsRequired().HasDefaultValue(0);

        builder.Property(l => l.Password).HasMaxLength(100);

        // Audit fields
        builder.Property(l => l.CreatedAt).IsRequired();
        builder.Property(l => l.CreatedBy);
        builder.Property(l => l.UpdatedAt);
        builder.Property(l => l.UpdatedBy);
        builder.Property(l => l.DeletedAt);
        builder.Property(l => l.DeletedBy);
        builder.Property(l => l.IsDeleted).IsRequired().HasDefaultValue(false);

        // Relationships
        builder
            .HasOne(l => l.Survey)
            .WithMany()
            .HasForeignKey(l => l.SurveyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasMany(l => l.Clicks)
            .WithOne(c => c.SurveyLink)
            .HasForeignKey(c => c.SurveyLinkId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(l => l.Token).IsUnique();
        builder.HasIndex(l => l.SurveyId);
        builder.HasIndex(l => l.IsActive);
        builder.HasIndex(l => l.IsDeleted);
        builder.HasIndex(l => l.CreatedAt);
    }
}
