namespace SurveyApp.Domain.Enums;

/// <summary>
/// Represents the type of a survey question.
/// </summary>
public enum QuestionType
{
    /// <summary>
    /// Single choice question with radio buttons.
    /// </summary>
    SingleChoice = 0,

    /// <summary>
    /// Multiple choice question with checkboxes.
    /// </summary>
    MultipleChoice = 1,

    /// <summary>
    /// Short text input.
    /// </summary>
    Text = 2,

    /// <summary>
    /// Long text input (paragraph).
    /// </summary>
    LongText = 3,

    /// <summary>
    /// Rating question (e.g., 1-5 stars).
    /// </summary>
    Rating = 4,

    /// <summary>
    /// Scale question (e.g., 1-10).
    /// </summary>
    Scale = 5,

    /// <summary>
    /// Matrix question with rows and columns.
    /// </summary>
    Matrix = 6,

    /// <summary>
    /// Date picker question.
    /// </summary>
    Date = 7,

    /// <summary>
    /// DateTime question.
    /// </summary>
    DateTime = 71,

    /// <summary>
    /// File upload question.
    /// </summary>
    FileUpload = 8,

    /// <summary>
    /// Yes/No question.
    /// </summary>
    YesNo = 9,

    /// <summary>
    /// Dropdown selection.
    /// </summary>
    Dropdown = 10,

    /// <summary>
    /// Net Promoter Score (0-10).
    /// </summary>
    NPS = 11,

    /// <summary>
    /// Checkbox question (alias for MultipleChoice).
    /// </summary>
    Checkbox = 12,

    /// <summary>
    /// Number input question.
    /// </summary>
    Number = 13,

    /// <summary>
    /// Short text input (alias for Text).
    /// </summary>
    ShortText = 14,

    /// <summary>
    /// Email input question.
    /// </summary>
    Email = 15,

    /// <summary>
    /// Phone number input question with customizable format validation.
    /// </summary>
    Phone = 16,

    /// <summary>
    /// URL input question with validation.
    /// </summary>
    Url = 17,

    /// <summary>
    /// Ranking question where respondents order items by preference.
    /// </summary>
    Ranking = 18,
}
