namespace SurveyApp.API.Extensions;

/// <summary>
/// Extension methods for configuring CORS policies.
/// </summary>
public static class CorsExtensions
{
    public const string AllowAllPolicy = "AllowAll";
    public const string ProductionPolicy = "Production";

    /// <summary>
    /// Adds CORS policies for development and production environments.
    /// </summary>
    public static IServiceCollection AddCorsPolicies(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        services.AddCors(options =>
        {
            // Development policy - allows all origins
            options.AddPolicy(
                AllowAllPolicy,
                policy =>
                {
                    policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
                }
            );

            // Production policy - restricted to configured origins
            options.AddPolicy(
                ProductionPolicy,
                policy =>
                {
                    policy
                        .WithOrigins(
                            configuration.GetSection("AllowedOrigins").Get<string[]>() ?? []
                        )
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials();
                }
            );
        });

        return services;
    }

    /// <summary>
    /// Gets the appropriate CORS policy name based on the environment.
    /// </summary>
    public static string GetCorsPolicyName(this IWebHostEnvironment environment)
    {
        return environment.IsDevelopment() ? AllowAllPolicy : ProductionPolicy;
    }
}
