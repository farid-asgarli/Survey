using Asp.Versioning;

namespace SurveyApp.API.Extensions;

/// <summary>
/// Extension methods for configuring API versioning.
/// </summary>
public static class ApiVersioningExtensions
{
    /// <summary>
    /// Adds API versioning with URL segment, header, and query string support.
    /// </summary>
    public static IServiceCollection AddApiVersioningConfiguration(this IServiceCollection services)
    {
        services
            .AddApiVersioning(options =>
            {
                options.DefaultApiVersion = new ApiVersion(1, 0);
                options.AssumeDefaultVersionWhenUnspecified = true;
                options.ReportApiVersions = true;
                options.ApiVersionReader = ApiVersionReader.Combine(
                    new UrlSegmentApiVersionReader(),
                    new HeaderApiVersionReader("X-Api-Version"),
                    new QueryStringApiVersionReader("api-version")
                );
            })
            .AddApiExplorer(options =>
            {
                options.GroupNameFormat = "'v'VVV";
                options.SubstituteApiVersionInUrl = true;
            });

        return services;
    }
}
