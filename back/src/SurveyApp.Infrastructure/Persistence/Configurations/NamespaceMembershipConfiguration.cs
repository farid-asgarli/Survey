using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class NamespaceMembershipConfiguration : IEntityTypeConfiguration<NamespaceMembership>
{
    public void Configure(EntityTypeBuilder<NamespaceMembership> builder)
    {
        builder.ToTable("namespace_memberships", DbSchemas.Core);

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Role).IsRequired();

        builder.Property(m => m.JoinedAt).IsRequired();

        builder.Property(m => m.InvitedBy).HasMaxLength(50);

        // Relationships are configured in NamespaceConfiguration and UserConfiguration

        // Indexes
        builder.HasIndex(m => new { m.NamespaceId, m.UserId }).IsUnique();
        builder.HasIndex(m => m.Role);
    }
}
