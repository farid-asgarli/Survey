using SurveyApp.Application.Common.Interfaces;

namespace SurveyApp.API.Services;

/// <summary>
/// Scoped service that holds the current language context for a request.
/// </summary>
public class LanguageContext : ILanguageContext
{
    public string? CurrentLanguage { get; private set; }

    public bool HasLanguage => !string.IsNullOrEmpty(CurrentLanguage);

    public void SetLanguage(string languageCode)
    {
        CurrentLanguage = languageCode?.ToLowerInvariant();
    }

    public void Clear()
    {
        CurrentLanguage = null;
    }

    public string GetLanguageOrDefault(string defaultLanguage = "en")
    {
        return HasLanguage ? CurrentLanguage! : defaultLanguage;
    }
}
