namespace SurveyApp.Application.Common.Interfaces;

/// <summary>
/// Service for generating survey link URLs.
/// </summary>
public interface ILinkUrlService
{
    /// <summary>
    /// Gets the base URL for the application.
    /// </summary>
    string BaseUrl { get; }

    /// <summary>
    /// Builds a full URL for a survey link token.
    /// </summary>
    /// <param name="token">The link token.</param>
    /// <returns>The full URL.</returns>
    string BuildLinkUrl(string token);

    /// <summary>
    /// Builds a QR code URL for a survey link token.
    /// </summary>
    /// <param name="token">The link token.</param>
    /// <returns>The QR code URL.</returns>
    string BuildQrCodeUrl(string token);
}
