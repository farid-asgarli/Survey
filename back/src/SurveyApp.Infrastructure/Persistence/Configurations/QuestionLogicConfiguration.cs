using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class QuestionLogicConfiguration : IEntityTypeConfiguration<QuestionLogic>
{
    public void Configure(EntityTypeBuilder<QuestionLogic> builder)
    {
        builder.ToTable("QuestionLogics");

        builder.HasKey(ql => ql.Id);

        builder.Property(ql => ql.QuestionId).IsRequired();

        builder.Property(ql => ql.SourceQuestionId).IsRequired();

        builder.Property(ql => ql.Operator).IsRequired().HasConversion<string>().HasMaxLength(30);

        builder.Property(ql => ql.ConditionValue).IsRequired().HasMaxLength(1000);

        builder.Property(ql => ql.Action).IsRequired().HasConversion<string>().HasMaxLength(30);

        builder.Property(ql => ql.TargetQuestionId);

        builder.Property(ql => ql.Priority).IsRequired().HasDefaultValue(0);

        // Audit fields
        builder.Property(ql => ql.CreatedAt).IsRequired();
        builder.Property(ql => ql.CreatedBy);
        builder.Property(ql => ql.UpdatedAt);
        builder.Property(ql => ql.UpdatedBy);
        builder.Property(ql => ql.DeletedAt);
        builder.Property(ql => ql.DeletedBy);
        builder.Property(ql => ql.IsDeleted).IsRequired().HasDefaultValue(false);

        // Relationships
        builder
            .HasOne(ql => ql.Question)
            .WithMany()
            .HasForeignKey(ql => ql.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(ql => ql.SourceQuestion)
            .WithMany()
            .HasForeignKey(ql => ql.SourceQuestionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasOne(ql => ql.TargetQuestion)
            .WithMany()
            .HasForeignKey(ql => ql.TargetQuestionId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(ql => ql.QuestionId);
        builder.HasIndex(ql => ql.SourceQuestionId);
        builder.HasIndex(ql => ql.TargetQuestionId);
        builder.HasIndex(ql => new { ql.QuestionId, ql.Priority });
        builder.HasIndex(ql => ql.IsDeleted);
    }
}
