using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SurveyApp.Application.Common.Interfaces;

namespace SurveyApp.Infrastructure.Services;

/// <summary>
/// Geolocation service using configurable IP geolocation API.
/// Default provider is ip-api.com (free for non-commercial use).
/// </summary>
public class GeoLocationService(
    HttpClient httpClient,
    IMemoryCache cache,
    ILogger<GeoLocationService> logger,
    IOptions<GeoLocationOptions> options
) : IGeoLocationService
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly IMemoryCache _cache = cache;
    private readonly ILogger<GeoLocationService> _logger = logger;
    private readonly GeoLocationOptions _options = options.Value;

    public async Task<GeoLocationResult?> GetLocationAsync(
        string ipAddress,
        CancellationToken cancellationToken = default
    )
    {
        // Check if geolocation is enabled
        if (!_options.Enabled)
        {
            return null;
        }

        if (string.IsNullOrWhiteSpace(ipAddress))
        {
            return null;
        }

        // Skip localhost/private IPs - they can't be geolocated
        if (IsPrivateOrLocalhost(ipAddress))
        {
            _logger.LogDebug(
                "Skipping geolocation for private/localhost IP: {IpAddress}",
                ipAddress
            );
            return null;
        }

        // Check cache first
        var cacheKey = $"geo:{ipAddress}";
        if (_cache.TryGetValue(cacheKey, out GeoLocationResult? cachedResult))
        {
            return cachedResult;
        }

        try
        {
            // Query the geolocation API
            // Fields: status, country, countryCode, region, regionName, city, lat, lon, timezone, isp
            var requestUrl =
                $"{_options.BaseUrl.TrimEnd('/')}/{ipAddress}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp";
            var response = await _httpClient.GetFromJsonAsync<IpApiResponse>(
                requestUrl,
                cancellationToken
            );

            if (response == null || response.Status != "success")
            {
                _logger.LogWarning(
                    "Geolocation lookup failed for IP {IpAddress}: {Message}",
                    ipAddress,
                    response?.Message ?? "Unknown error"
                );
                return null;
            }

            var result = new GeoLocationResult
            {
                Country = response.Country,
                CountryCode = response.CountryCode,
                City = response.City,
                Region = response.RegionName,
                Latitude = response.Lat,
                Longitude = response.Lon,
                Timezone = response.Timezone,
                Isp = response.Isp,
            };

            // Cache the result
            var cacheDuration = TimeSpan.FromHours(_options.CacheHours);
            _cache.Set(cacheKey, result, cacheDuration);

            return result;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(
                ex,
                "HTTP error during geolocation lookup for IP {IpAddress}",
                ipAddress
            );
            return null;
        }
        catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException)
        {
            _logger.LogWarning("Geolocation lookup timed out for IP {IpAddress}", ipAddress);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Unexpected error during geolocation lookup for IP {IpAddress}",
                ipAddress
            );
            return null;
        }
    }

    private static bool IsPrivateOrLocalhost(string ipAddress)
    {
        // Handle localhost
        if (ipAddress == "127.0.0.1" || ipAddress == "::1" || ipAddress == "localhost")
        {
            return true;
        }

        // Handle IPv4 private ranges
        if (
            ipAddress.StartsWith("10.")
            || ipAddress.StartsWith("192.168.")
            || ipAddress.StartsWith("172.16.")
            || ipAddress.StartsWith("172.17.")
            || ipAddress.StartsWith("172.18.")
            || ipAddress.StartsWith("172.19.")
            || ipAddress.StartsWith("172.20.")
            || ipAddress.StartsWith("172.21.")
            || ipAddress.StartsWith("172.22.")
            || ipAddress.StartsWith("172.23.")
            || ipAddress.StartsWith("172.24.")
            || ipAddress.StartsWith("172.25.")
            || ipAddress.StartsWith("172.26.")
            || ipAddress.StartsWith("172.27.")
            || ipAddress.StartsWith("172.28.")
            || ipAddress.StartsWith("172.29.")
            || ipAddress.StartsWith("172.30.")
            || ipAddress.StartsWith("172.31.")
        )
        {
            return true;
        }

        // Handle IPv6 private ranges (simplified)
        if (
            ipAddress.StartsWith("fe80:", StringComparison.OrdinalIgnoreCase)
            || // Link-local
            ipAddress.StartsWith("fc", StringComparison.OrdinalIgnoreCase)
            || // Unique local
            ipAddress.StartsWith("fd", StringComparison.OrdinalIgnoreCase)
        ) // Unique local
        {
            return true;
        }

        return false;
    }

    /// <summary>
    /// Response model for ip-api.com
    /// </summary>
    private sealed class IpApiResponse
    {
        [JsonPropertyName("status")]
        public string? Status { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }

        [JsonPropertyName("country")]
        public string? Country { get; set; }

        [JsonPropertyName("countryCode")]
        public string? CountryCode { get; set; }

        [JsonPropertyName("region")]
        public string? Region { get; set; }

        [JsonPropertyName("regionName")]
        public string? RegionName { get; set; }

        [JsonPropertyName("city")]
        public string? City { get; set; }

        [JsonPropertyName("lat")]
        public double? Lat { get; set; }

        [JsonPropertyName("lon")]
        public double? Lon { get; set; }

        [JsonPropertyName("timezone")]
        public string? Timezone { get; set; }

        [JsonPropertyName("isp")]
        public string? Isp { get; set; }
    }
}
