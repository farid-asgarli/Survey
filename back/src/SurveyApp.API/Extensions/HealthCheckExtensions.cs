using Microsoft.AspNetCore.Diagnostics.HealthChecks;

namespace SurveyApp.API.Extensions;

/// <summary>
/// Extension methods for configuring health checks.
/// </summary>
public static class HealthCheckExtensions
{
    /// <summary>
    /// Adds health check services with PostgreSQL database check.
    /// </summary>
    public static IServiceCollection AddHealthCheckServices(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        services
            .AddHealthChecks()
            .AddNpgSql(
                configuration.GetConnectionString("DefaultConnection")!,
                name: "postgresql",
                tags: ["db", "sql", "postgresql"]
            );

        return services;
    }

    /// <summary>
    /// Maps health check endpoints for monitoring.
    /// </summary>
    public static IEndpointRouteBuilder MapHealthCheckEndpoints(
        this IEndpointRouteBuilder endpoints
    )
    {
        // Detailed health check with all checks
        endpoints.MapHealthChecks(
            "/health",
            new HealthCheckOptions { ResponseWriter = WriteHealthCheckResponse }
        );

        // Readiness check - includes database
        endpoints.MapHealthChecks(
            "/health/ready",
            new HealthCheckOptions { Predicate = check => check.Tags.Contains("db") }
        );

        // Liveness check - just confirms app is running
        endpoints.MapHealthChecks(
            "/health/live",
            new HealthCheckOptions { Predicate = _ => false }
        );

        return endpoints;
    }

    private static async Task WriteHealthCheckResponse(
        HttpContext context,
        Microsoft.Extensions.Diagnostics.HealthChecks.HealthReport report
    )
    {
        context.Response.ContentType = "application/json";

        var result = new
        {
            status = report.Status.ToString(),
            timestamp = DateTime.UtcNow,
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                description = e.Value.Description,
                duration = e.Value.Duration.TotalMilliseconds,
            }),
        };

        await context.Response.WriteAsJsonAsync(result);
    }
}
