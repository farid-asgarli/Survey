using System.Threading.RateLimiting;
using Asp.Versioning;
using Microsoft.OpenApi.Models;
using Serilog;
using SurveyApp.API.Localization;
using SurveyApp.API.Middleware;
using SurveyApp.API.Services;
using SurveyApp.Application;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    // .WriteTo.File("logs/surveyapp-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
// Note: Enums are serialized as integers (not strings) for API efficiency
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure API Versioning
builder
    .Services.AddApiVersioning(options =>
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

// Configure Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Global fixed window limiter
    options.AddPolicy(
        "fixed",
        httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
                factory: _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 100,
                    Window = TimeSpan.FromMinutes(1),
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = 10,
                }
            )
    );

    // Per-namespace sliding window limiter
    options.AddPolicy(
        "per-namespace",
        httpContext =>
            RateLimitPartition.GetSlidingWindowLimiter(
                partitionKey: httpContext.Request.Headers["X-Namespace-Id"].ToString() ?? "default",
                factory: _ => new SlidingWindowRateLimiterOptions
                {
                    PermitLimit = 1000,
                    Window = TimeSpan.FromMinutes(1),
                    SegmentsPerWindow = 4,
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = 20,
                }
            )
    );

    // Strict limiter for auth endpoints
    options.AddPolicy(
        "auth",
        httpContext =>
            RateLimitPartition.GetTokenBucketLimiter(
                partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
                factory: _ => new TokenBucketRateLimiterOptions
                {
                    TokenLimit = 10,
                    ReplenishmentPeriod = TimeSpan.FromMinutes(1),
                    TokensPerPeriod = 10,
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = 5,
                }
            )
    );
});

// Configure Health Checks
builder
    .Services.AddHealthChecks()
    .AddNpgSql(
        builder.Configuration.GetConnectionString("DefaultConnection")!,
        name: "postgresql",
        tags: ["db", "sql", "postgresql"]
    );

// Configure Swagger
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc(
        "v1",
        new OpenApiInfo
        {
            Title = "SurveyApp API",
            Version = "v1",
            Description = "A multi-tenant survey management system API",
            Contact = new OpenApiContact
            {
                Name = "SurveyApp Team",
                Email = "support@surveyapp.com",
            },
        }
    );

    // JWT Authentication in Swagger
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

    // Namespace header for multi-tenancy
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

    // Use fully qualified type names to avoid conflicts with duplicate class names
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
});

// Add Application Layer services
builder.Services.AddApplicationServices();

// Add Infrastructure Layer services
builder.Services.AddInfrastructureServices(builder.Configuration);

// Add JSON-based localization
builder.Services.AddJsonLocalization();

// Add HTTP context accessor
builder.Services.AddHttpContextAccessor();

// Add API services
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<INamespaceContext, NamespaceContext>();
builder.Services.AddScoped<ILanguageContext, LanguageContext>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
        }
    );

    options.AddPolicy(
        "Production",
        policy =>
        {
            policy
                .WithOrigins(
                    builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? []
                )
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        }
    );
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "SurveyApp API v1");
    options.RoutePrefix = string.Empty; // Serve Swagger UI at root
});

app.UseHttpsRedirection();

// Localization (before other middleware that may need localized strings)
app.UseJsonLocalization();

// Add custom middleware
app.UseRequestLogging();
app.UseExceptionHandling();

// Rate Limiting
app.UseRateLimiter();

// CORS
app.UseCors(app.Environment.IsDevelopment() ? "AllowAll" : "Production");

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Namespace context middleware (after auth)
app.UseNamespaceContext();

// Language context middleware (extracts Accept-Language header)
app.UseLanguageContext();

app.MapControllers();

// Health check endpoints
app.MapHealthChecks(
    "/health",
    new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
    {
        ResponseWriter = async (context, report) =>
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
        },
    }
);

app.MapHealthChecks(
    "/health/ready",
    new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
    {
        Predicate = check => check.Tags.Contains("db"),
    }
);

app.MapHealthChecks(
    "/health/live",
    new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
    {
        Predicate = _ => false, // No checks, just confirms app is running
    }
);

// Seed database on startup
await SeedDatabaseAsync(app);

try
{
    Log.Information("Starting SurveyApp API");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

// Database seeding method
static async Task SeedDatabaseAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;

    try
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogInformation("Starting database seeding...");

        var seeder =
            services.GetRequiredService<SurveyApp.Infrastructure.Persistence.DatabaseSeeder>();
        await seeder.SeedAsync();

        logger.LogInformation("Database seeding completed successfully");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database");
    }
}

// Make Program class accessible for testing
public partial class Program { }
