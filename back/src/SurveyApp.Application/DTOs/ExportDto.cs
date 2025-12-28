namespace SurveyApp.Application.DTOs;

/// <summary>
/// Supported export formats.
/// </summary>
public enum ExportFormat
{
    Csv,
    Excel,
    Json,
}

/// <summary>
/// Request for exporting survey responses.
/// </summary>
public class ExportRequest
{
    /// <summary>
    /// The survey ID to export responses from.
    /// </summary>
    public Guid SurveyId { get; set; }

    /// <summary>
    /// The export format.
    /// </summary>
    public ExportFormat Format { get; set; }

    /// <summary>
    /// Optional filter for the export.
    /// </summary>
    public ExportFilter? Filter { get; set; }

    /// <summary>
    /// Specific question IDs to include (null = all questions).
    /// </summary>
    public List<Guid>? QuestionIds { get; set; }

    /// <summary>
    /// Whether to include metadata (IP, UserAgent, etc.).
    /// </summary>
    public bool IncludeMetadata { get; set; }

    /// <summary>
    /// Whether to include incomplete responses.
    /// </summary>
    public bool IncludeIncomplete { get; set; }

    /// <summary>
    /// Timezone ID for date formatting.
    /// </summary>
    public string? TimezoneId { get; set; }
}

/// <summary>
/// Filter options for export.
/// </summary>
public class ExportFilter
{
    /// <summary>
    /// Date range for filtering responses.
    /// </summary>
    public DateRange? DateRange { get; set; }

    /// <summary>
    /// Filter by respondent email.
    /// </summary>
    public string? RespondentEmail { get; set; }

    /// <summary>
    /// Filter by completion status.
    /// </summary>
    public bool? IsComplete { get; set; }
}

/// <summary>
/// Date range for filtering.
/// </summary>
public class DateRange
{
    /// <summary>
    /// Start date (inclusive).
    /// </summary>
    public DateTime? StartDate { get; set; }

    /// <summary>
    /// End date (inclusive).
    /// </summary>
    public DateTime? EndDate { get; set; }
}

/// <summary>
/// Result of an export operation.
/// </summary>
public class ExportResult
{
    /// <summary>
    /// The exported data.
    /// </summary>
    public byte[] Data { get; set; } = Array.Empty<byte>();

    /// <summary>
    /// The suggested filename.
    /// </summary>
    public string FileName { get; set; } = null!;

    /// <summary>
    /// The content type (MIME type).
    /// </summary>
    public string ContentType { get; set; } = null!;

    /// <summary>
    /// Total number of rows exported.
    /// </summary>
    public int TotalRows { get; set; }
}

/// <summary>
/// DTO for export preview information.
/// </summary>
public class ExportPreviewDto
{
    /// <summary>
    /// Survey ID.
    /// </summary>
    public Guid SurveyId { get; set; }

    /// <summary>
    /// Survey title.
    /// </summary>
    public string SurveyTitle { get; set; } = null!;

    /// <summary>
    /// Total number of responses available.
    /// </summary>
    public int TotalResponses { get; set; }

    /// <summary>
    /// Number of completed responses.
    /// </summary>
    public int CompletedResponses { get; set; }

    /// <summary>
    /// Number of incomplete responses.
    /// </summary>
    public int IncompleteResponses { get; set; }

    /// <summary>
    /// Available columns/questions for export.
    /// </summary>
    public List<ExportColumnDto> Columns { get; set; } = [];

    /// <summary>
    /// Available export formats.
    /// </summary>
    public List<string> AvailableFormats { get; set; } = ["Csv", "Excel", "Json"];
}

/// <summary>
/// DTO for export column information.
/// </summary>
public class ExportColumnDto
{
    /// <summary>
    /// Column identifier (Question ID or metadata field name).
    /// </summary>
    public string Id { get; set; } = null!;

    /// <summary>
    /// Column header/name.
    /// </summary>
    public string Name { get; set; } = null!;

    /// <summary>
    /// Column type (Question, Metadata).
    /// </summary>
    public string Type { get; set; } = null!;

    /// <summary>
    /// Whether the column is selected by default.
    /// </summary>
    public bool IsDefault { get; set; } = true;
}
