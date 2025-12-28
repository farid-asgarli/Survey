namespace SurveyApp.Domain.Enums;

/// <summary>
/// Represents the subscription tier of a namespace.
/// </summary>
public enum SubscriptionTier
{
    /// <summary>
    /// Free tier with limited features.
    /// </summary>
    Free = 0,

    /// <summary>
    /// Pro tier with advanced features.
    /// </summary>
    Pro = 1,

    /// <summary>
    /// Enterprise tier with full features and support.
    /// </summary>
    Enterprise = 2
}
