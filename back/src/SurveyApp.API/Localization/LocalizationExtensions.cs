using System.Globalization;
using Microsoft.AspNetCore.Localization;
using Microsoft.Extensions.Localization;

namespace SurveyApp.API.Localization;

/// <summary>
/// Extension methods for configuring localization services.
/// </summary>
public static class LocalizationExtensions
{
    /// <summary>
    /// Supported cultures for the application.
    /// </summary>
    public static readonly string[] SupportedCultures = ["en", "az", "ru"];

    /// <summary>
    /// Default culture when no culture is specified.
    /// </summary>
    public const string DefaultCulture = "en";

    /// <summary>
    /// Adds JSON-based localization services to the service collection.
    /// </summary>
    public static IServiceCollection AddJsonLocalization(this IServiceCollection services)
    {
        var resourcesPath = Path.Combine(AppContext.BaseDirectory, "Resources");

        services.AddSingleton<IStringLocalizerFactory>(sp =>
        {
            var loggerFactory = sp.GetRequiredService<ILoggerFactory>();
            return new JsonStringLocalizerFactory(resourcesPath, loggerFactory);
        });

        services.AddSingleton<IStringLocalizer>(sp =>
        {
            var factory = sp.GetRequiredService<IStringLocalizerFactory>();
            return factory.Create(typeof(LocalizationExtensions));
        });

        services.AddLocalization();

        services.Configure<RequestLocalizationOptions>(options =>
        {
            var supportedCultures = SupportedCultures
                .Select(c => new CultureInfo(c))
                .ToList();

            options.DefaultRequestCulture = new RequestCulture(DefaultCulture);
            options.SupportedCultures = supportedCultures;
            options.SupportedUICultures = supportedCultures;

            // Culture providers in order of priority
            options.RequestCultureProviders = new List<IRequestCultureProvider>
            {
                // 1. Accept-Language header (most common for APIs)
                new AcceptLanguageHeaderRequestCultureProvider(),
                // 2. Query string (?culture=az)
                new QueryStringRequestCultureProvider(),
                // 3. Custom header (X-Language)
                new CustomHeaderRequestCultureProvider(),
            };
        });

        return services;
    }

    /// <summary>
    /// Configures the request localization middleware.
    /// </summary>
    public static IApplicationBuilder UseJsonLocalization(this IApplicationBuilder app)
    {
        app.UseRequestLocalization();
        return app;
    }
}

/// <summary>
/// Custom culture provider that reads from X-Language header.
/// </summary>
public class CustomHeaderRequestCultureProvider : RequestCultureProvider
{
    public override Task<ProviderCultureResult?> DetermineProviderCultureResult(HttpContext httpContext)
    {
        var languageHeader = httpContext.Request.Headers["X-Language"].FirstOrDefault();

        if (string.IsNullOrEmpty(languageHeader))
        {
            return NullProviderCultureResult;
        }

        // Validate that the culture is supported
        if (!LocalizationExtensions.SupportedCultures.Contains(languageHeader, StringComparer.OrdinalIgnoreCase))
        {
            return NullProviderCultureResult;
        }

        return Task.FromResult<ProviderCultureResult?>(
            new ProviderCultureResult(languageHeader));
    }
}
