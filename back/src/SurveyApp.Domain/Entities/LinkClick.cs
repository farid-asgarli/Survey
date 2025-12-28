using SurveyApp.Domain.Common;

namespace SurveyApp.Domain.Entities;

/// <summary>
/// Represents a click/visit on a survey link for analytics.
/// </summary>
public class LinkClick : Entity<Guid>
{
    /// <summary>
    /// Gets the survey link ID this click belongs to.
    /// </summary>
    public Guid SurveyLinkId { get; private set; }

    /// <summary>
    /// Gets when the click occurred.
    /// </summary>
    public DateTime ClickedAt { get; private set; }

    /// <summary>
    /// Gets the IP address of the visitor.
    /// </summary>
    public string? IpAddress { get; private set; }

    /// <summary>
    /// Gets the user agent string.
    /// </summary>
    public string? UserAgent { get; private set; }

    /// <summary>
    /// Gets the referrer URL.
    /// </summary>
    public string? Referrer { get; private set; }

    /// <summary>
    /// Gets the country (from IP geolocation).
    /// </summary>
    public string? Country { get; private set; }

    /// <summary>
    /// Gets the city (from IP geolocation).
    /// </summary>
    public string? City { get; private set; }

    /// <summary>
    /// Gets the device type (Desktop, Mobile, Tablet).
    /// </summary>
    public string? DeviceType { get; private set; }

    /// <summary>
    /// Gets the browser name.
    /// </summary>
    public string? Browser { get; private set; }

    /// <summary>
    /// Gets the operating system.
    /// </summary>
    public string? OperatingSystem { get; private set; }

    /// <summary>
    /// Gets the associated response ID if the user completed the survey.
    /// </summary>
    public Guid? ResponseId { get; private set; }

    /// <summary>
    /// Gets the survey link navigation property.
    /// </summary>
    public SurveyLink SurveyLink { get; private set; } = null!;

    /// <summary>
    /// Gets the survey response navigation property.
    /// </summary>
    public SurveyResponse? Response { get; private set; }

    private LinkClick() { }

    private LinkClick(
        Guid id,
        Guid surveyLinkId,
        string? ipAddress,
        string? userAgent,
        string? referrer
    )
        : base(id)
    {
        SurveyLinkId = surveyLinkId;
        ClickedAt = DateTime.UtcNow;
        IpAddress = ipAddress;
        UserAgent = userAgent;
        Referrer = referrer;
    }

    /// <summary>
    /// Creates a new link click record.
    /// </summary>
    public static LinkClick Create(
        Guid surveyLinkId,
        string? ipAddress = null,
        string? userAgent = null,
        string? referrer = null
    )
    {
        return new LinkClick(Guid.NewGuid(), surveyLinkId, ipAddress, userAgent, referrer);
    }

    /// <summary>
    /// Sets the geolocation data.
    /// </summary>
    public void SetGeolocation(string? country, string? city)
    {
        Country = country;
        City = city;
    }

    /// <summary>
    /// Sets the device information.
    /// </summary>
    public void SetDeviceInfo(string? deviceType, string? browser, string? operatingSystem)
    {
        DeviceType = deviceType;
        Browser = browser;
        OperatingSystem = operatingSystem;
    }

    /// <summary>
    /// Associates this click with a completed response.
    /// </summary>
    public void AssociateResponse(Guid responseId)
    {
        ResponseId = responseId;
    }
}
