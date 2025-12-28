using System.Text.Json;
using System.Text.Json.Serialization;
using SurveyApp.Domain.Common;

namespace SurveyApp.Domain.ValueObjects;

/// <summary>
/// Represents translated question settings for localized question options and labels.
/// </summary>
public sealed class TranslatedQuestionSettings : ValueObject
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        WriteIndented = false,
    };

    /// <summary>
    /// Gets the translated options for choice-based questions.
    /// </summary>
    public IReadOnlyList<string>? Options { get; init; }

    /// <summary>
    /// Gets the translated minimum label for scale questions.
    /// </summary>
    public string? MinLabel { get; init; }

    /// <summary>
    /// Gets the translated maximum label for scale questions.
    /// </summary>
    public string? MaxLabel { get; init; }

    /// <summary>
    /// Gets the translated rows for matrix questions.
    /// </summary>
    public IReadOnlyList<string>? MatrixRows { get; init; }

    /// <summary>
    /// Gets the translated columns for matrix questions.
    /// </summary>
    public IReadOnlyList<string>? MatrixColumns { get; init; }

    /// <summary>
    /// Gets the translated placeholder text for text questions.
    /// </summary>
    public string? Placeholder { get; init; }

    /// <summary>
    /// Gets the translated validation error message.
    /// </summary>
    public string? ValidationMessage { get; init; }

    /// <summary>
    /// Gets the translated "Other" option label (when AllowOther is enabled).
    /// </summary>
    public string? OtherLabel { get; init; }

    /// <summary>
    /// Creates an empty translated settings object.
    /// </summary>
    public static TranslatedQuestionSettings Empty => new();

    /// <summary>
    /// Creates translated settings for choice-based questions.
    /// </summary>
    public static TranslatedQuestionSettings ForChoiceQuestion(
        IEnumerable<string> options,
        string? otherLabel = null
    )
    {
        return new TranslatedQuestionSettings
        {
            Options = options.ToList().AsReadOnly(),
            OtherLabel = otherLabel,
        };
    }

    /// <summary>
    /// Creates translated settings for scale/rating questions.
    /// </summary>
    public static TranslatedQuestionSettings ForScaleQuestion(string? minLabel, string? maxLabel)
    {
        return new TranslatedQuestionSettings { MinLabel = minLabel, MaxLabel = maxLabel };
    }

    /// <summary>
    /// Creates translated settings for matrix questions.
    /// </summary>
    public static TranslatedQuestionSettings ForMatrixQuestion(
        IEnumerable<string> rows,
        IEnumerable<string> columns
    )
    {
        return new TranslatedQuestionSettings
        {
            MatrixRows = rows.ToList().AsReadOnly(),
            MatrixColumns = columns.ToList().AsReadOnly(),
        };
    }

    /// <summary>
    /// Creates translated settings for text questions.
    /// </summary>
    public static TranslatedQuestionSettings ForTextQuestion(
        string? placeholder,
        string? validationMessage = null
    )
    {
        return new TranslatedQuestionSettings
        {
            Placeholder = placeholder,
            ValidationMessage = validationMessage,
        };
    }

    /// <summary>
    /// Serializes the settings to JSON.
    /// </summary>
    public string ToJson()
    {
        return JsonSerializer.Serialize(this, JsonOptions);
    }

    /// <summary>
    /// Deserializes settings from JSON.
    /// </summary>
    public static TranslatedQuestionSettings? FromJson(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return null;

        try
        {
            return JsonSerializer.Deserialize<TranslatedQuestionSettings>(json, JsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Options != null ? string.Join(",", Options) : null;
        yield return MinLabel;
        yield return MaxLabel;
        yield return MatrixRows != null ? string.Join(",", MatrixRows) : null;
        yield return MatrixColumns != null ? string.Join(",", MatrixColumns) : null;
        yield return Placeholder;
        yield return ValidationMessage;
        yield return OtherLabel;
    }
}
