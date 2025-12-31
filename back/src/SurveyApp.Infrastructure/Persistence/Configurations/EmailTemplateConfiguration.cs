using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class EmailTemplateConfiguration : IEntityTypeConfiguration<EmailTemplate>
{
    public void Configure(EntityTypeBuilder<EmailTemplate> builder)
    {
        builder.ToTable("EmailTemplates");

        builder.HasKey(x => x.Id);

        // Ignore computed properties (resolved from translations)
        builder.Ignore(x => x.Name);
        builder.Ignore(x => x.Subject);
        builder.Ignore(x => x.HtmlBody);
        builder.Ignore(x => x.PlainTextBody);
        builder.Ignore(x => x.DesignJson);

        builder
            .Property(x => x.DefaultLanguage)
            .IsRequired()
            .HasMaxLength(10)
            .HasDefaultValue("en");

        builder.Property(x => x.NamespaceId).IsRequired();

        builder.Property(x => x.Type).IsRequired().HasConversion<string>().HasMaxLength(50);

        builder.Property(x => x.IsDefault).IsRequired().HasDefaultValue(false);

        // Store placeholders as JSON with value comparer
        // Use backing field since property is IReadOnlyList<string>
        builder
            .Property<List<string>>("_availablePlaceholders")
            .HasColumnName("AvailablePlaceholders")
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
            .HasColumnType("text")
            .Metadata.SetValueComparer(
                new ValueComparer<List<string>>(
                    (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c.ToList()
                )
            );

        builder.Ignore(x => x.AvailablePlaceholders);

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
        builder.HasIndex(x => new
        {
            x.NamespaceId,
            x.Type,
            x.IsDefault,
        });

        // Translations relationship - configure from parent side
        builder
            .HasMany(x => x.Translations)
            .WithOne(t => t.EmailTemplate)
            .HasForeignKey(t => t.EmailTemplateId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(x => x.Translations).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
