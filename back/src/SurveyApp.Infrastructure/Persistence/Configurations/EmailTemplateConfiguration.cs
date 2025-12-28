using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class EmailTemplateConfiguration : IEntityTypeConfiguration<EmailTemplate>
{
    public void Configure(EntityTypeBuilder<EmailTemplate> builder)
    {
        builder.ToTable("EmailTemplates");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.NamespaceId).IsRequired();

        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);

        builder.Property(x => x.Type).IsRequired().HasConversion<string>().HasMaxLength(50);

        builder.Property(x => x.Subject).IsRequired().HasMaxLength(500);

        builder.Property(x => x.HtmlBody).IsRequired();

        builder.Property(x => x.PlainTextBody);

        // Store design JSON for visual editor state (blocks, styles, preheader)
        builder.Property(x => x.DesignJson).HasColumnType("text");

        builder.Property(x => x.IsDefault).IsRequired().HasDefaultValue(false);

        // Store placeholders as JSON
        builder
            .Property(x => x.AvailablePlaceholders)
            .HasConversion(
                v =>
                    System.Text.Json.JsonSerializer.Serialize(
                        v,
                        (System.Text.Json.JsonSerializerOptions?)null
                    ),
                v =>
                    System.Text.Json.JsonSerializer.Deserialize<List<string>>(
                        v,
                        (System.Text.Json.JsonSerializerOptions?)null
                    ) ?? new List<string>()
            )
            .HasColumnType("text");

        // Audit fields
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.CreatedBy);
        builder.Property(x => x.UpdatedAt);
        builder.Property(x => x.UpdatedBy);
        builder.Property(x => x.IsDeleted).IsRequired().HasDefaultValue(false);
        builder.Property(x => x.DeletedAt);
        builder.Property(x => x.DeletedBy);

        // Indexes
        builder.HasIndex(x => x.NamespaceId);
        builder
            .HasIndex(x => new { x.NamespaceId, x.Name })
            .IsUnique()
            .HasFilter("\"IsDeleted\" = false");
        builder.HasIndex(x => new
        {
            x.NamespaceId,
            x.Type,
            x.IsDefault,
        });
    }
}
