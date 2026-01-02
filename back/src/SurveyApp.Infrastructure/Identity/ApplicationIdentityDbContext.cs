using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SurveyApp.Infrastructure.Persistence;

namespace SurveyApp.Infrastructure.Identity;

public class ApplicationIdentityDbContext(DbContextOptions<ApplicationIdentityDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Set default schema for all Identity tables
        builder.HasDefaultSchema(DbSchemas.Identity);

        // Customize Identity tables if needed
        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(u => u.FirstName).HasMaxLength(50).IsRequired();
            entity.Property(u => u.LastName).HasMaxLength(50).IsRequired();
            entity.Property(u => u.RefreshToken).HasMaxLength(256);

            // Azure AD SSO Properties (for future SSO integration)
            entity.Property(u => u.AzureAdObjectId).HasMaxLength(100);
            entity.Property(u => u.AzureAdTenantId).HasMaxLength(100);
            entity.Property(u => u.ExternalProvider).HasMaxLength(50);

            // Indexes
            entity
                .HasIndex(u => u.AzureAdObjectId)
                .IsUnique()
                .HasFilter("\"AzureAdObjectId\" IS NOT NULL");
            entity.HasIndex(u => u.DomainUserId);
        });
    }
}
