namespace SurveyApp.Application.Common.Interfaces;

/// <summary>
/// Service for looking up geolocation data from IP addresses.
/// </summary>
public interface IGeoLocationService
{
    /// <summary>
    /// Gets geolocation information for an IP address.
    /// </summary>
    /// <param name="ipAddress">The IP address to look up.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Geolocation data or null if lookup fails.</returns>
    Task<GeoLocationResult?> GetLocationAsync(
        string ipAddress,
        CancellationToken cancellationToken = default
    );
}

/// <summary>
/// Result of a geolocation lookup.
/// </summary>
public record GeoLocationResult
{
    /// <summary>
    /// Country name (e.g., "United States").
    /// </summary>
    public string? Country { get; init; }

    /// <summary>
    /// ISO 3166-1 alpha-2 country code (e.g., "US").
    /// </summary>
    public string? CountryCode { get; init; }

    /// <summary>
    /// City name.
    /// </summary>
    public string? City { get; init; }

    /// <summary>
    /// Region/state name.
    /// </summary>
    public string? Region { get; init; }

    /// <summary>
    /// Latitude coordinate.
    /// </summary>
    public double? Latitude { get; init; }

    /// <summary>
    /// Longitude coordinate.
    /// </summary>
    public double? Longitude { get; init; }

    /// <summary>
    /// Timezone (e.g., "America/New_York").
    /// </summary>
    public string? Timezone { get; init; }

    /// <summary>
    /// Internet Service Provider name.
    /// </summary>
    public string? Isp { get; init; }
}
