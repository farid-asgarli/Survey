namespace SurveyApp.Infrastructure.Services;

/// <summary>
/// Configuration options for the geolocation service.
/// </summary>
public class GeoLocationOptions
{
    public const string SectionName = "GeoLocation";

    /// <summary>
    /// Whether geolocation is enabled. Default is true.
    /// </summary>
    public bool Enabled { get; set; } = true;

    /// <summary>
    /// Base URL for the geolocation API.
    /// Default is ip-api.com (free for non-commercial use).
    /// </summary>
    public string BaseUrl { get; set; } = "http://ip-api.com/json";

    /// <summary>
    /// Timeout in seconds for geolocation requests.
    /// Default is 5 seconds to avoid blocking response recording.
    /// </summary>
    public int TimeoutSeconds { get; set; } = 5;

    /// <summary>
    /// Cache duration in hours for geolocation results.
    /// Default is 24 hours.
    /// </summary>
    public int CacheHours { get; set; } = 24;
}
