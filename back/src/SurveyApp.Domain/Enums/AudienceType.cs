namespace SurveyApp.Domain.Enums;

/// <summary>
/// Defines the type of audience for recurring surveys.
/// </summary>
public enum AudienceType
{
    /// <summary>
    /// Fixed email list provided during configuration.
    /// </summary>
    StaticList,

    /// <summary>
    /// Dynamic list from audience management.
    /// </summary>
    DynamicList,

    /// <summary>
    /// All contacts in the namespace.
    /// </summary>
    AllContacts,

    /// <summary>
    /// Previous respondents of the survey.
    /// </summary>
    PreviousRespondents,
}
