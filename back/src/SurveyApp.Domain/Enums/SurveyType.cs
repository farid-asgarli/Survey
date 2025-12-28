namespace SurveyApp.Domain.Enums;

/// <summary>
/// Represents the type/category of a survey.
/// </summary>
public enum SurveyType
{
    /// <summary>
    /// Classic form-style survey with traditional question flow.
    /// </summary>
    Classic = 0,

    /// <summary>
    /// Customer Experience survey (NPS, CES, CSAT).
    /// </summary>
    CustomerExperience = 1,

    /// <summary>
    /// Conversational chat-style survey.
    /// </summary>
    Conversational = 2,

    /// <summary>
    /// Research survey (Conjoint, MaxDiff, etc.).
    /// </summary>
    Research = 3,

    /// <summary>
    /// 360-degree assessment survey for employee evaluations.
    /// </summary>
    Assessment360 = 4,
}
