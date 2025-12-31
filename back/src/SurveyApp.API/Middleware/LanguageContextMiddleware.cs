using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.API.Middleware;

/// <summary>
/// Middleware that extracts language preference from the request and sets the language context.
/// Supports: Accept-Language header, X-Language header, and ?lang query parameter.
/// </summary>
public class LanguageContextMiddleware(RequestDelegate next)
{
    private readonly RequestDelegate _next = next;

    private const string LanguageHeader = "X-Language";
    private const string LanguageQueryParam = "lang";

    public async Task InvokeAsync(HttpContext context, ILanguageContext languageContext)
    {
        var language = ResolveLanguage(context);

        if (!string.IsNullOrEmpty(language))
        {
            languageContext.SetLanguage(language);
        }

        await _next(context);
    }

    private static string? ResolveLanguage(HttpContext context)
    {
        // Priority 1: Query parameter (?lang=es)
        if (context.Request.Query.TryGetValue(LanguageQueryParam, out var queryLang))
        {
            var lang = queryLang.ToString();
            if (IsSupported(lang))
            {
                return lang;
            }
        }

        // Priority 2: X-Language header
        if (context.Request.Headers.TryGetValue(LanguageHeader, out var headerLang))
        {
            var lang = headerLang.ToString();
            if (IsSupported(lang))
            {
                return lang;
            }
        }

        // Priority 3: Accept-Language header (parse the primary language)
        if (context.Request.Headers.TryGetValue("Accept-Language", out var acceptLanguage))
        {
            var lang = ParseAcceptLanguage(acceptLanguage.ToString());
            if (!string.IsNullOrEmpty(lang) && IsSupported(lang))
            {
                return lang;
            }
        }

        return null;
    }

    private static bool IsSupported(string? languageCode) => LanguageCode.IsSupported(languageCode);

    /// <summary>
    /// Parses the Accept-Language header and returns the highest priority supported language.
    /// Example: "es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7" -> "es"
    /// </summary>
    private static string? ParseAcceptLanguage(string acceptLanguage)
    {
        if (string.IsNullOrWhiteSpace(acceptLanguage))
            return null;

        var languages = acceptLanguage
            .Split(',')
            .Select(ParseLanguageWithQuality)
            .Where(x => x.language != null && IsSupported(x.language))
            .OrderByDescending(x => x.quality)
            .Select(x => x.language!.Split('-', '_')[0].ToLowerInvariant())
            .FirstOrDefault();

        return languages;
    }

    private static (string? language, double quality) ParseLanguageWithQuality(string part)
    {
        var segments = part.Trim().Split(';');
        var language = segments[0].Trim();

        double quality = 1.0;
        if (segments.Length > 1)
        {
            var qPart = segments[1].Trim();
            if (qPart.StartsWith("q=", StringComparison.OrdinalIgnoreCase))
            {
                double.TryParse(qPart.AsSpan(2), out quality);
            }
        }

        return (language, quality);
    }
}

public static class LanguageContextMiddlewareExtensions
{
    public static IApplicationBuilder UseLanguageContext(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<LanguageContextMiddleware>();
    }
}
