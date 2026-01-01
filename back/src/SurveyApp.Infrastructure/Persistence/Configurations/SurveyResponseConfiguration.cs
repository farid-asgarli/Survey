using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class SurveyResponseConfiguration : IEntityTypeConfiguration<SurveyResponse>
{
    public void Configure(EntityTypeBuilder<SurveyResponse> builder)
    {
        builder.ToTable("SurveyResponses");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.SurveyLinkId);
        builder.Property(r => r.RespondentEmail).HasMaxLength(256);
        builder.Property(r => r.RespondentName).HasMaxLength(100);
        builder.Property(r => r.IpAddress).HasMaxLength(45);
        builder.Property(r => r.UserAgent).HasMaxLength(500);
        builder.Property(r => r.AccessToken).IsRequired().HasMaxLength(100);

        builder.Property(r => r.IsComplete).IsRequired().HasDefaultValue(false);

        builder.Property(r => r.StartedAt).IsRequired();

        builder.Property(r => r.SubmittedAt);
        builder.Property(r => r.TimeSpentSeconds);

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
            .HasOne(r => r.Respondent)
            .WithMany()
            .HasForeignKey("RespondentUserId")
            .OnDelete(DeleteBehavior.SetNull);

        builder
            .HasOne(r => r.SurveyLink)
            .WithMany()
            .HasForeignKey(r => r.SurveyLinkId)
            .OnDelete(DeleteBehavior.SetNull);

        builder
            .HasMany(r => r.Answers)
            .WithOne(a => a.Response)
            .HasForeignKey(a => a.ResponseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(r => r.SurveyId);
        builder.HasIndex(r => r.SurveyLinkId);
        builder.HasIndex(r => r.RespondentEmail);
        builder.HasIndex(r => r.IsComplete);
        builder.HasIndex(r => r.SubmittedAt);
        builder.HasIndex(r => r.IsDeleted);
    }
}
