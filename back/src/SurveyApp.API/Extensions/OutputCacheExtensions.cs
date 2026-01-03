namespace SurveyApp.API.Extensions;

/// <summary>
/// Extension methods for configuring output caching.
/// </summary>
public static class OutputCacheExtensions
{
    /// <summary>
    /// Adds output caching with predefined policies for analytics and expensive read operations.
    /// </summary>
    public static IServiceCollection AddOutputCachePolicies(this IServiceCollection services)
    {
        services.AddOutputCache(options =>
        {
            // Default policy with short duration
            options.AddBasePolicy(builder => builder.Expire(TimeSpan.FromSeconds(30)));

            // Analytics cache policy - 5 minutes with tag for invalidation
            options.AddPolicy(
                "Analytics",
                builder =>
                    builder
                        .Expire(TimeSpan.FromMinutes(5))
                        .Tag("survey-analytics")
                        .SetVaryByRouteValue("id")
            );

            // NPS cache policy - 5 minutes
            options.AddPolicy(
                "Nps",
                builder =>
                    builder
                        .Expire(TimeSpan.FromMinutes(5))
                        .Tag("survey-nps")
                        .SetVaryByRouteValue("id")
            );

            // Public survey cache - 1 minute
            options.AddPolicy(
                "PublicSurvey",
                builder =>
                    builder
                        .Expire(TimeSpan.FromMinutes(1))
                        .Tag("public-survey")
                        .SetVaryByRouteValue("shareToken")
            );

            // Export preview cache - 2 minutes
            options.AddPolicy(
                "ExportPreview",
                builder =>
                    builder
                        .Expire(TimeSpan.FromMinutes(2))
                        .Tag("export-preview")
                        .SetVaryByRouteValue("id")
            );
        });

        return services;
    }
}
