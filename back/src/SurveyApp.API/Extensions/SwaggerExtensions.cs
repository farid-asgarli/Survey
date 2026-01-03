using Microsoft.OpenApi.Models;

namespace SurveyApp.API.Extensions;

/// <summary>
/// Extension methods for configuring Swagger/OpenAPI.
/// </summary>
public static class SwaggerExtensions
{
    /// <summary>
    /// Adds Swagger generation with API documentation and security definitions.
    /// </summary>
    public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", CreateApiInfo());

            AddJwtSecurityDefinition(options);
            AddNamespaceSecurityDefinition(options);
            ConfigureSchemaIds(options);
        });

        return services;
    }

    /// <summary>
    /// Configures the Swagger UI middleware.
    /// </summary>
    public static IApplicationBuilder UseSwaggerDocumentation(this IApplicationBuilder app)
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "SurveyApp API v1");
            options.RoutePrefix = string.Empty;
        });

        return app;
    }

    private static OpenApiInfo CreateApiInfo()
    {
        return new OpenApiInfo
        {
            Title = "SurveyApp API",
            Version = "v1",
            Description = "A multi-tenant survey management system API",
            Contact = new OpenApiContact
            {
                Name = "SurveyApp Team",
                Email = "support@surveyapp.com",
            },
        };
    }

    private static void AddJwtSecurityDefinition(
        Swashbuckle.AspNetCore.SwaggerGen.SwaggerGenOptions options
    )
    {
        options.AddSecurityDefinition(
            "Bearer",
            new OpenApiSecurityScheme
            {
                Description =
                    "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer",
            }
        );

        options.AddSecurityRequirement(
            new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer",
                        },
                    },
                    Array.Empty<string>()
                },
            }
        );
    }

    private static void AddNamespaceSecurityDefinition(
        Swashbuckle.AspNetCore.SwaggerGen.SwaggerGenOptions options
    )
    {
        options.AddSecurityDefinition(
            "Namespace",
            new OpenApiSecurityScheme
            {
                Description = "Namespace ID header for multi-tenant context",
                Name = "X-Namespace-Id",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
            }
        );
    }

    private static void ConfigureSchemaIds(
        Swashbuckle.AspNetCore.SwaggerGen.SwaggerGenOptions options
    )
    {
        options.CustomSchemaIds(type =>
        {
            // For nested types, use parent type name as prefix
            if (type.DeclaringType != null)
            {
                return $"{type.DeclaringType.Name}_{type.Name}";
            }

            // For types in Features folder, prefix with feature name
            var ns = type.Namespace ?? "";
            if (ns.Contains(".Features."))
            {
                var parts = ns.Split('.');
                var featureIndex = Array.IndexOf(parts, "Features");
                if (featureIndex >= 0 && featureIndex + 1 < parts.Length)
                {
                    return $"{parts[featureIndex + 1]}_{type.Name}";
                }
            }

            return type.Name;
        });
    }
}
