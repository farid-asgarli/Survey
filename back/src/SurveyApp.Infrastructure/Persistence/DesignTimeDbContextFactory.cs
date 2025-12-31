using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using SurveyApp.Application.Common.Interfaces;

namespace SurveyApp.Infrastructure.Persistence;

/// <summary>
/// Factory for creating ApplicationDbContext at design time (for migrations).
/// </summary>
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        // Build configuration from appsettings
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../SurveyApp.API"))
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection");

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new ApplicationDbContext(
            optionsBuilder.Options,
            new DesignTimeCurrentUserService(),
            new DesignTimeDateTimeService()
        );
    }

    /// <summary>
    /// Stub implementation of ICurrentUserService for design-time use.
    /// </summary>
    private class DesignTimeCurrentUserService : ICurrentUserService
    {
        public Guid? UserId => null;
        public string? Email => "design-time@example.com";
        public bool IsAuthenticated => false;
    }

    /// <summary>
    /// Stub implementation of IDateTimeService for design-time use.
    /// </summary>
    private class DesignTimeDateTimeService : IDateTimeService
    {
        public DateTime Now => DateTime.UtcNow;
        public DateTime UtcNow => DateTime.UtcNow;
    }
}
