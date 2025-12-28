using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class SurveyTemplateConfiguration : IEntityTypeConfiguration<SurveyTemplate>
{
    public void Configure(EntityTypeBuilder<SurveyTemplate> builder)
    {
        builder.ToTable("SurveyTemplates");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name).IsRequired().HasMaxLength(200);

        builder.Property(t => t.Description).HasMaxLength(2000);

        builder.Property(t => t.Category).HasMaxLength(100);

        builder.Property(t => t.WelcomeMessage).HasMaxLength(1000);

        builder.Property(t => t.ThankYouMessage).HasMaxLength(1000);

        builder.Property(t => t.IsPublic).IsRequired().HasDefaultValue(false);

        builder.Property(t => t.DefaultAllowAnonymous).IsRequired().HasDefaultValue(true);

        builder.Property(t => t.DefaultAllowMultipleResponses).IsRequired().HasDefaultValue(false);

        builder.Property(t => t.UsageCount).IsRequired().HasDefaultValue(0);

        // Audit fields
        builder.Property(t => t.CreatedAt).IsRequired();
        builder.Property(t => t.CreatedBy);
        builder.Property(t => t.UpdatedAt);
        builder.Property(t => t.UpdatedBy);
        builder.Property(t => t.DeletedAt);
        builder.Property(t => t.DeletedBy);
        builder.Property(t => t.IsDeleted).IsRequired().HasDefaultValue(false);

        // Relationships
        builder
            .HasMany(t => t.Questions)
            .WithOne(q => q.Template)
            .HasForeignKey(q => q.TemplateId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(t => t.Namespace)
            .WithMany()
            .HasForeignKey(t => t.NamespaceId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(t => t.NamespaceId);
        builder.HasIndex(t => t.Category);
        builder.HasIndex(t => t.IsPublic);
        builder.HasIndex(t => t.CreatedAt);
        builder.HasIndex(t => t.IsDeleted);
        builder.HasIndex(t => new { t.NamespaceId, t.Name }).IsUnique();
    }
}
