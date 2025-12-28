namespace SurveyApp.Domain.Enums;

/// <summary>
/// Represents the type of survey link.
/// </summary>
public enum SurveyLinkType
{
    /// <summary>
    /// Standard public link accessible to anyone.
    /// </summary>
    Public,

    /// <summary>
    /// One-time use link that can only be used once.
    /// </summary>
    Unique,

    /// <summary>
    /// Link with tracking parameters (UTM).
    /// </summary>
    Campaign,

    /// <summary>
    /// Link designed for iframe embedding.
    /// </summary>
    Embedded,

    /// <summary>
    /// Link specifically generated for QR codes.
    /// </summary>
    QrCode,
}
