using SurveyApp.API.Localization;
using SurveyApp.API.Services;
using SurveyApp.Application;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Infrastructure;

namespace SurveyApp.API.Extensions;

/// <summary>
/// Extension methods for registering API-specific services.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Adds all API layer services including localization and context services.
    /// </summary>
    public static IServiceCollection AddApiServices(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        // Core services
        services.AddControllers();
        services.AddEndpointsApiExplorer();
        services.AddHttpContextAccessor();

        // Application and Infrastructure layers
        services.AddApplicationServices();
        services.AddInfrastructureServices(configuration);

        // Localization
        services.AddJsonLocalization();

        // Context services
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<INamespaceContext, NamespaceContext>();
        services.AddScoped<ILanguageContext, LanguageContext>();

        return services;
    }
}
