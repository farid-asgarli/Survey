using Microsoft.Extensions.Localization;

namespace SurveyApp.API.Localization;

/// <summary>
/// Factory for creating JSON-based string localizers.
/// </summary>
public class JsonStringLocalizerFactory(string resourcesPath, ILoggerFactory loggerFactory)
    : IStringLocalizerFactory
{
    private readonly string _resourcesPath = resourcesPath;
    private readonly ILoggerFactory _loggerFactory = loggerFactory;

    public IStringLocalizer Create(Type resourceSource)
    {
        return new JsonStringLocalizer(
            _resourcesPath,
            _loggerFactory.CreateLogger<JsonStringLocalizer>()
        );
    }

    public IStringLocalizer Create(string baseName, string location)
    {
        return new JsonStringLocalizer(
            _resourcesPath,
            _loggerFactory.CreateLogger<JsonStringLocalizer>()
        );
    }
}
