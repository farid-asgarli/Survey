using System.Text.Json;
using System.Text.Json.Serialization;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Domain.Common;

/// <summary>
/// Represents a selected option in an answer.
/// Stores both the option ID (for aggregation) and text (for historical record).
/// </summary>
public sealed record SelectedOption(
    [property: JsonPropertyName("id")] Guid Id,
    [property: JsonPropertyName("text")] string Text
)
{
    public static SelectedOption FromOption(QuestionOption option) => new(option.Id, option.Text);
}

/// <summary>
/// Structured answer value supporting both choice-based and free-text answers.
/// </summary>
public sealed class AnswerValue
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    /// <summary>
    /// Selected options for choice questions. Empty for text questions.
    /// </summary>
    [JsonPropertyName("options")]
    public IReadOnlyList<SelectedOption> Options { get; init; } = [];

    /// <summary>
    /// Free text value. Used for text questions or "Other" input.
    /// </summary>
    [JsonPropertyName("text")]
    public string? Text { get; init; }

    /// <summary>
    /// Creates answer for single-choice question.
    /// </summary>
    public static AnswerValue ForSingleChoice(QuestionOption option)
    {
        return new AnswerValue { Options = [SelectedOption.FromOption(option)] };
    }

    /// <summary>
    /// Creates answer for multi-choice question.
    /// </summary>
    public static AnswerValue ForMultiChoice(IEnumerable<QuestionOption> options)
    {
        return new AnswerValue { Options = [.. options.Select(SelectedOption.FromOption)] };
    }

    /// <summary>
    /// Creates answer for multi-choice with "Other" text.
    /// </summary>
    public static AnswerValue ForMultiChoiceWithOther(
        IEnumerable<QuestionOption> options,
        string otherText
    )
    {
        return new AnswerValue
        {
            Options = [.. options.Select(SelectedOption.FromOption)],
            Text = otherText,
        };
    }

    /// <summary>
    /// Creates answer for text-based questions.
    /// </summary>
    public static AnswerValue ForText(string text)
    {
        return new AnswerValue { Text = text };
    }

    /// <summary>
    /// Serializes to JSON for storage.
    /// </summary>
    public string ToJson() => JsonSerializer.Serialize(this, JsonOptions);

    /// <summary>
    /// Deserializes from JSON storage.
    /// </summary>
    public static AnswerValue FromJson(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return new AnswerValue();

        try
        {
            return JsonSerializer.Deserialize<AnswerValue>(json, JsonOptions) ?? new AnswerValue();
        }
        catch (JsonException)
        {
            // Legacy plain text format
            return new AnswerValue { Text = json };
        }
    }

    /// <summary>
    /// Gets all selected option IDs.
    /// </summary>
    public IEnumerable<Guid> GetOptionIds() => Options.Select(o => o.Id);

    /// <summary>
    /// Checks if specific option is selected.
    /// </summary>
    public bool HasOption(Guid optionId) => Options.Any(o => o.Id == optionId);

    /// <summary>
    /// Gets display text (for UI/export).
    /// </summary>
    public string GetDisplayText()
    {
        if (Options.Count == 0)
            return Text ?? string.Empty;

        var optionTexts = string.Join(", ", Options.Select(o => o.Text));
        return string.IsNullOrEmpty(Text) ? optionTexts : $"{optionTexts}, Other: {Text}";
    }
}
