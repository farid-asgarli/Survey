using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.DTOs;

/// <summary>
/// DTO for survey link data.
/// </summary>
public class SurveyLinkDto
{
    public Guid Id { get; set; }
    public Guid SurveyId { get; set; }
    public string Token { get; set; } = null!;
    public string FullUrl { get; set; } = null!;
    public SurveyLinkType Type { get; set; }
    public string? Name { get; set; }
    public string? Source { get; set; }
    public string? Medium { get; set; }
    public string? Campaign { get; set; }
    public bool IsActive { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public int? MaxUses { get; set; }
    public int UsageCount { get; set; }
    public int ResponseCount { get; set; }
    public bool HasPassword { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for survey link details including prefill data.
/// </summary>
public class SurveyLinkDetailsDto : SurveyLinkDto
{
    public Dictionary<string, string>? PrefillData { get; set; }
}

/// <summary>
/// DTO for creating a survey link.
/// </summary>
public class CreateSurveyLinkDto
{
    public SurveyLinkType Type { get; set; }
    public string? Name { get; set; }
    public string? Source { get; set; }
    public string? Medium { get; set; }
    public string? Campaign { get; set; }
    public Dictionary<string, string>? PrefillData { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public int? MaxUses { get; set; }
    public string? Password { get; set; }
}

/// <summary>
/// DTO for updating a survey link.
/// </summary>
public class UpdateSurveyLinkDto
{
    public string? Name { get; set; }
    public string? Source { get; set; }
    public string? Medium { get; set; }
    public string? Campaign { get; set; }
    public Dictionary<string, string>? PrefillData { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public int? MaxUses { get; set; }
    public string? Password { get; set; }
    public bool? IsActive { get; set; }
}

/// <summary>
/// DTO for link analytics data.
/// </summary>
public class LinkAnalyticsDto
{
    public Guid LinkId { get; set; }
    public string LinkName { get; set; } = null!;
    public int TotalClicks { get; set; }
    public int UniqueClicks { get; set; }
    public int TotalResponses { get; set; }
    public decimal ConversionRate { get; set; }
    public List<ClicksByDateDto> ClicksByDate { get; set; } = [];
    public List<ClicksByCountryDto> ClicksByCountry { get; set; } = [];
    public List<ClicksByDeviceDto> ClicksByDevice { get; set; } = [];
    public List<ClicksByBrowserDto> ClicksByBrowser { get; set; } = [];
    public List<ClicksByReferrerDto> ClicksByReferrer { get; set; } = [];
    public List<TopCityDto> TopCities { get; set; } = [];
}

/// <summary>
/// DTO for clicks by date data.
/// </summary>
public class ClicksByDateDto
{
    public string Date { get; set; } = null!;
    public int Clicks { get; set; }
    public int UniqueClicks { get; set; }
}

/// <summary>
/// DTO for clicks by country data.
/// </summary>
public class ClicksByCountryDto
{
    public string Country { get; set; } = null!;
    public string CountryCode { get; set; } = null!;
    public int Clicks { get; set; }
    public decimal Percentage { get; set; }
}

/// <summary>
/// DTO for clicks by device data.
/// </summary>
public class ClicksByDeviceDto
{
    public string Device { get; set; } = null!;
    public int Clicks { get; set; }
    public decimal Percentage { get; set; }
}

/// <summary>
/// DTO for clicks by browser data.
/// </summary>
public class ClicksByBrowserDto
{
    public string Browser { get; set; } = null!;
    public int Clicks { get; set; }
    public decimal Percentage { get; set; }
}

/// <summary>
/// DTO for clicks by referrer data.
/// </summary>
public class ClicksByReferrerDto
{
    public string Referrer { get; set; } = null!;
    public int Clicks { get; set; }
    public decimal Percentage { get; set; }
}

/// <summary>
/// DTO for top city data.
/// </summary>
public class TopCityDto
{
    public string City { get; set; } = null!;
    public string Country { get; set; } = null!;
    public int Clicks { get; set; }
}

/// <summary>
/// DTO for link click trend data point.
/// </summary>
public class LinkClickTrendDto
{
    public DateTime Date { get; set; }
    public int Clicks { get; set; }
    public int Responses { get; set; }
}

/// <summary>
/// DTO for link click data.
/// </summary>
public class LinkClickDto
{
    public Guid Id { get; set; }
    public DateTime ClickedAt { get; set; }
    public string? Country { get; set; }
    public string? City { get; set; }
    public string? DeviceType { get; set; }
    public string? Browser { get; set; }
    public string? OperatingSystem { get; set; }
    public string? Referrer { get; set; }
    public bool HasResponse { get; set; }
}

/// <summary>
/// DTO for bulk link generation request.
/// </summary>
public class BulkLinkGenerationDto
{
    public int Count { get; set; }
    public string? NamePrefix { get; set; }
    public string? Source { get; set; }
    public string? Medium { get; set; }
    public string? Campaign { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

/// <summary>
/// DTO for bulk link generation result.
/// </summary>
public class BulkLinkGenerationResultDto
{
    /// <summary>
    /// Number of links that were requested to be generated.
    /// </summary>
    public int RequestedCount { get; set; }

    /// <summary>
    /// Number of links that were actually generated.
    /// </summary>
    public int GeneratedCount { get; set; }

    /// <summary>
    /// The generated links.
    /// </summary>
    public List<SurveyLinkDto> Links { get; set; } = [];
}

/// <summary>
/// DTO for QR code generation result.
/// </summary>
public class QrCodeResultDto
{
    public Guid LinkId { get; set; }
    public string Token { get; set; } = null!;
    public string FullUrl { get; set; } = null!;
    public byte[] QrCodeImage { get; set; } = [];
    public string ContentType { get; set; } = "image/png";
}
