using Serilog;

namespace SurveyApp.API.Extensions;

/// <summary>
/// Extension methods for configuring Serilog logging.
/// </summary>
public static class LoggingExtensions
{
    /// <summary>
    /// Configures Serilog as the logging provider.
    /// </summary>
    public static WebApplicationBuilder AddSerilogLogging(this WebApplicationBuilder builder)
    {
        Log.Logger = new LoggerConfiguration()
            .ReadFrom.Configuration(builder.Configuration)
            .Enrich.FromLogContext()
            .WriteTo.Console()
            .WriteTo.File("logs/surveyapp-.txt", rollingInterval: RollingInterval.Day)
            .CreateLogger();

        builder.Host.UseSerilog();

        return builder;
    }
}
