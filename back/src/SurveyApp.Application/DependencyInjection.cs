using System.Reflection;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using SurveyApp.Application.Behaviors;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.Services;

namespace SurveyApp.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // Register MediatR (11.x API)
        services.AddMediatR(assembly);

        // Register AutoMapper
        services.AddAutoMapper(assembly);

        // Register FluentValidation validators
        services.AddValidatorsFromAssembly(assembly);

        // Register namespace command context (scoped per request)
        services.AddScoped<INamespaceCommandContext, NamespaceCommandContextAccessor>();

        // Register application services
        services.AddScoped<IQuestionSettingsMapper, QuestionSettingsMapper>();
        services.AddScoped<ISurveyAuthorizationService, SurveyAuthorizationService>();

        // Register MediatR pipeline behaviors (order matters!)
        // 1. Validation first (FluentValidation)
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        // 2. Namespace validation (auth + permission checks)
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(NamespaceValidationBehavior<,>));
        // 3. Logging
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
        // 4. Performance monitoring
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(PerformanceBehavior<,>));
        // 5. Transaction management
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(TransactionBehavior<,>));
        // 6. Audit logging
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(AuditBehavior<,>));

        return services;
    }
}
