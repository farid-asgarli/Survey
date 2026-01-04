using Serilog;
using SurveyApp.API.Extensions;
using SurveyApp.API.Localization;
using SurveyApp.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Configure logging
builder.AddSerilogLogging();

// Configure services
builder
    .Services.AddApiServices(builder.Configuration)
    .AddApiVersioningConfiguration()
    .AddRateLimitingPolicies()
    // .AddOutputCachePolicies()
    .AddHealthCheckServices(builder.Configuration)
    .AddSwaggerDocumentation()
    .AddCorsPolicies(builder.Configuration);

var app = builder.Build();

// Configure middleware pipeline
app.UseSwaggerDocumentation();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors(app.Environment.GetCorsPolicyName());
app.UseJsonLocalization();
app.UseRequestLogging();
app.UseExceptionHandling();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// app.UseOutputCache();
app.UseNamespaceContext();
app.UseLanguageContext();

// Map endpoints
app.MapControllers();
app.MapHealthCheckEndpoints();

// Seed database and run application
await SeedDatabaseAsync(app);
await RunApplicationAsync(app);

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

static async Task RunApplicationAsync(WebApplication app)
{
    try
    {
        Log.Information("Starting SurveyApp API");
        await app.RunAsync();
    }
    catch (Exception ex)
    {
        Log.Fatal(ex, "Application terminated unexpectedly");
    }
    finally
    {
        await Log.CloseAndFlushAsync();
    }
}

public partial class Program { }
