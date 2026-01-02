using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class AnswerConfiguration : IEntityTypeConfiguration<Answer>
{
    public void Configure(EntityTypeBuilder<Answer> builder)
    {
        builder.ToTable("answers", DbSchemas.Survey);

        builder.HasKey(a => a.Id);

        builder.Property(a => a.AnswerValue).HasColumnType("text");
        builder.Property(a => a.AnsweredAt).IsRequired();

        // Audit fields
        builder.Property(a => a.CreatedAt).IsRequired();
        builder.Property(a => a.CreatedBy);
        builder.Property(a => a.UpdatedAt);
        builder.Property(a => a.UpdatedBy);
        builder.Property(a => a.DeletedAt);
        builder.Property(a => a.DeletedBy);
        builder.Property(a => a.IsDeleted).IsRequired().HasDefaultValue(false);

        // Relationships
        builder
            .HasOne(a => a.Question)
            .WithMany()
            .HasForeignKey(a => a.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(a => a.ResponseId);
        builder.HasIndex(a => a.QuestionId);
        builder.HasIndex(a => new { a.ResponseId, a.QuestionId }).IsUnique();
        builder.HasIndex(a => a.IsDeleted);
    }
}
