namespace SurveyApp.Application.DTOs;

/// <summary>
/// Selected option in an answer.
/// </summary>
public class SelectedOptionDto
{
    /// <summary>
    /// Option ID (for aggregation).
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Option text at time of selection (historical record).
    /// </summary>
    public string Text { get; set; } = null!;
}

/// <summary>
/// DTO for answer data.
/// </summary>
public class AnswerDto
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }

    /// <summary>
    /// Selected options for choice questions.
    /// </summary>
    public List<SelectedOptionDto>? SelectedOptions { get; set; }

    /// <summary>
    /// Text value for text questions or "Other" input.
    /// </summary>
    public string? Text { get; set; }

    /// <summary>
    /// Display text (computed from options + text).
    /// </summary>
    public string DisplayValue { get; set; } = null!;

    public DateTime AnsweredAt { get; set; }

    /// <summary>
    /// File URLs for file upload questions.
    /// Parsed from Text field when question type is FileUpload.
    /// </summary>
    public List<string>? FileUrls { get; set; }

    /// <summary>
    /// Matrix answers for matrix questions.
    /// Key is row label, value is selected column label.
    /// Parsed from Text field when question type is Matrix.
    /// </summary>
    public Dictionary<string, string>? MatrixAnswers { get; set; }
}
