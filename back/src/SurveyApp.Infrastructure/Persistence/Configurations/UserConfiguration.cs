using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SurveyApp.Domain.Entities;

namespace SurveyApp.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users", DbSchemas.Core);

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Email).IsRequired().HasMaxLength(256);
        builder.HasIndex(u => u.Email).IsUnique();

        builder.Property(u => u.FirstName).IsRequired().HasMaxLength(50);

        builder.Property(u => u.LastName).IsRequired().HasMaxLength(50);

        builder.Property(u => u.PasswordHash).IsRequired();

        // AvatarId stores the avatar identifier (e.g., "avatar-01"), not a URL
        // Max length 20 is sufficient for "avatar-XX" format
        builder.Property(u => u.AvatarId).HasMaxLength(20).HasColumnName("avatar_id");

        builder.Property(u => u.EmailConfirmed).IsRequired().HasDefaultValue(false);

        builder.Property(u => u.LastLoginAt);

        builder.Property(u => u.IsActive).IsRequired().HasDefaultValue(true);

        // Audit fields
        builder.Property(u => u.CreatedAt).IsRequired();
        builder.Property(u => u.CreatedBy);
        builder.Property(u => u.UpdatedAt);
        builder.Property(u => u.UpdatedBy);
        builder.Property(u => u.DeletedAt);
        builder.Property(u => u.DeletedBy);
        builder.Property(u => u.IsDeleted).IsRequired().HasDefaultValue(false);

        // Relationships
        builder
            .HasMany(u => u.Memberships)
            .WithOne(m => m.User)
            .HasForeignKey(m => m.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(u => u.CreatedAt);
        builder.HasIndex(u => u.IsDeleted);
    }
}
