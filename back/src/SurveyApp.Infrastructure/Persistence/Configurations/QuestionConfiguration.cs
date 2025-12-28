using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class QuestionConfiguration : IEntityTypeConfiguration<Question>
{
    public void Configure(EntityTypeBuilder<Question> builder)
    {
        builder.ToTable("Questions");

        builder.HasKey(q => q.Id);

        builder.Property(q => q.Text).IsRequired().HasMaxLength(500);

        builder.Property(q => q.Description).HasMaxLength(1000);

        builder.Property(q => q.Type).IsRequired().HasConversion<string>().HasMaxLength(30);

        builder.Property(q => q.IsRequired).IsRequired().HasDefaultValue(false);

        builder.Property(q => q.Order).IsRequired();

        builder.Property(q => q.SettingsJson).HasColumnType("jsonb");

        // NPS properties
        builder.Property(q => q.IsNpsQuestion).IsRequired().HasDefaultValue(false);

        builder.Property(q => q.NpsType).HasConversion<string>().HasMaxLength(30);

        // Audit fields
        builder.Property(q => q.CreatedAt).IsRequired();
        builder.Property(q => q.CreatedBy);
        builder.Property(q => q.UpdatedAt);
        builder.Property(q => q.UpdatedBy);
        builder.Property(q => q.DeletedAt);
        builder.Property(q => q.DeletedBy);
        builder.Property(q => q.IsDeleted).IsRequired().HasDefaultValue(false);

        // Indexes
        builder.HasIndex(q => q.SurveyId);
        builder.HasIndex(q => new { q.SurveyId, q.Order });
        builder.HasIndex(q => q.IsDeleted);
        builder.HasIndex(q => q.IsNpsQuestion);
    }
}
