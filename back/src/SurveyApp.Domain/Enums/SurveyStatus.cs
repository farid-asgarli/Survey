namespace SurveyApp.Domain.Enums;

/// <summary>
/// Represents the status of a survey.
/// </summary>
public enum SurveyStatus
{
    /// <summary>
    /// Survey is being edited and not yet available for responses.
    /// </summary>
    Draft = 0,

    /// <summary>
    /// Survey is published and accepting responses.
    /// </summary>
    Published = 1,

    /// <summary>
    /// Survey is closed and no longer accepting responses.
    /// </summary>
    Closed = 2,

    /// <summary>
    /// Survey is archived and hidden from normal views.
    /// </summary>
    Archived = 3
}
