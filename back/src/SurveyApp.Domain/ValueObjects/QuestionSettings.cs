using System.Text.Json;
using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Domain.ValueObjects;

/// <summary>
/// Represents question-specific settings as a value object.
/// </summary>
public sealed class QuestionSettings : ValueObject
{
    private readonly Dictionary<string, JsonElement> _settings;

    /// <summary>
    /// Gets the options for choice-based questions.
    /// </summary>
    public IReadOnlyList<string>? Options { get; }

    /// <summary>
    /// Gets the minimum value for scale/rating questions.
    /// </summary>
    public int? MinValue { get; }

    /// <summary>
    /// Gets the maximum value for scale/rating questions.
    /// </summary>
    public int? MaxValue { get; }

    /// <summary>
    /// Gets the minimum label for scale questions.
    /// </summary>
    public string? MinLabel { get; }

    /// <summary>
    /// Gets the maximum label for scale questions.
    /// </summary>
    public string? MaxLabel { get; }

    /// <summary>
    /// Gets the allowed file types for file upload questions.
    /// </summary>
    public IReadOnlyList<string>? AllowedFileTypes { get; }

    /// <summary>
    /// Gets the maximum file size in bytes for file upload questions.
    /// </summary>
    public long? MaxFileSize { get; }

    /// <summary>
    /// Gets the rows for matrix questions.
    /// </summary>
    public IReadOnlyList<string>? MatrixRows { get; }

    /// <summary>
    /// Gets the columns for matrix questions.
    /// </summary>
    public IReadOnlyList<string>? MatrixColumns { get; }

    /// <summary>
    /// Gets the placeholder text for text questions.
    /// </summary>
    public string? Placeholder { get; }

    /// <summary>
    /// Gets whether the 'Other' option is allowed.
    /// </summary>
    public bool AllowOther { get; }

    /// <summary>
    /// Gets the maximum character length for text questions.
    /// </summary>
    public int? MaxLength { get; }

    /// <summary>
    /// Gets the minimum character length for text questions.
    /// </summary>
    public int? MinLength { get; }

    /// <summary>
    /// Gets the maximum selections allowed for multiple choice questions.
    /// </summary>
    public int? MaxSelections { get; }

    /// <summary>
    /// Gets the custom regex validation pattern for text-based questions.
    /// </summary>
    public string? ValidationPattern { get; }

    /// <summary>
    /// Gets the custom error message when validation pattern fails.
    /// </summary>
    public string? ValidationMessage { get; }

    /// <summary>
    /// Gets the name of a pre-defined validation pattern (e.g., "phone-us", "phone-international").
    /// </summary>
    public string? ValidationPreset { get; }

    /// <summary>
    /// Gets the visual style for rating questions (stars, hearts, thumbs, smileys, numbers).
    /// </summary>
    public RatingStyle? RatingStyle { get; }

    /// <summary>
    /// Gets the visual style for yes/no questions (text, thumbs, toggle, checkX).
    /// </summary>
    public YesNoStyle? YesNoStyle { get; }

    private QuestionSettings(
        IReadOnlyList<string>? options = null,
        int? minValue = null,
        int? maxValue = null,
        string? minLabel = null,
        string? maxLabel = null,
        IReadOnlyList<string>? allowedFileTypes = null,
        long? maxFileSize = null,
        IReadOnlyList<string>? matrixRows = null,
        IReadOnlyList<string>? matrixColumns = null,
        string? placeholder = null,
        bool allowOther = false,
        int? maxLength = null,
        int? minLength = null,
        int? maxSelections = null,
        string? validationPattern = null,
        string? validationMessage = null,
        string? validationPreset = null,
        RatingStyle? ratingStyle = null,
        YesNoStyle? yesNoStyle = null
    )
    {
        Options = options;
        MinValue = minValue;
        MaxValue = maxValue;
        MinLabel = minLabel;
        MaxLabel = maxLabel;
        AllowedFileTypes = allowedFileTypes;
        MaxFileSize = maxFileSize;
        MatrixRows = matrixRows;
        MatrixColumns = matrixColumns;
        Placeholder = placeholder;
        AllowOther = allowOther;
        MaxLength = maxLength;
        MinLength = minLength;
        MaxSelections = maxSelections;
        ValidationPattern = validationPattern;
        ValidationMessage = validationMessage;
        ValidationPreset = validationPreset;
        RatingStyle = ratingStyle;
        YesNoStyle = yesNoStyle;
        _settings = [];
    }

    /// <summary>
    /// Creates default settings for a question type.
    /// </summary>
    public static QuestionSettings CreateDefault(QuestionType questionType)
    {
        return questionType switch
        {
            QuestionType.SingleChoice => CreateChoiceSettings(["Option 1", "Option 2"]),
            QuestionType.MultipleChoice => CreateChoiceSettings(["Option 1", "Option 2"]),
            QuestionType.Dropdown => CreateChoiceSettings(["Option 1", "Option 2"]),
            QuestionType.Rating => CreateRatingSettings(1, 5),
            QuestionType.Scale => CreateScaleSettings(1, 10, "Low", "High"),
            QuestionType.NPS => CreateScaleSettings(0, 10, "Not likely", "Very likely"),
            QuestionType.Matrix => CreateMatrixSettings(
                ["Row 1", "Row 2"],
                ["Column 1", "Column 2"]
            ),
            QuestionType.FileUpload => CreateFileUploadSettings(
                [".pdf", ".doc", ".docx", ".jpg", ".png"],
                10 * 1024 * 1024
            ), // 10MB
            QuestionType.Text => CreateTextSettings(null, 500),
            QuestionType.LongText => CreateTextSettings(null, 5000),
            QuestionType.Email => CreateValidatedTextSettings(
                null,
                256,
                null,
                "Please enter a valid email address"
            ),
            QuestionType.Phone => CreateValidatedTextSettings(
                null,
                50,
                "phone-international",
                "Please enter a valid phone number"
            ),
            QuestionType.Url => CreateValidatedTextSettings(
                null,
                2048,
                null,
                "Please enter a valid URL"
            ),
            _ => new QuestionSettings(),
        };
    }

    /// <summary>
    /// Creates settings for choice-based questions.
    /// </summary>
    public static QuestionSettings CreateChoiceSettings(
        IReadOnlyList<string> options,
        bool allowOther = false
    )
    {
        if (options == null || options.Count == 0)
            throw new ArgumentException(
                "Options cannot be empty for choice questions.",
                nameof(options)
            );

        return new QuestionSettings(options: options, allowOther: allowOther);
    }

    /// <summary>
    /// Creates settings for rating questions.
    /// </summary>
    public static QuestionSettings CreateRatingSettings(int minValue = 1, int maxValue = 5)
    {
        if (minValue >= maxValue)
            throw new ArgumentException("Max value must be greater than min value.");

        return new QuestionSettings(minValue: minValue, maxValue: maxValue);
    }

    /// <summary>
    /// Creates settings for scale questions.
    /// </summary>
    public static QuestionSettings CreateScaleSettings(
        int minValue,
        int maxValue,
        string? minLabel = null,
        string? maxLabel = null
    )
    {
        if (minValue >= maxValue)
            throw new ArgumentException("Max value must be greater than min value.");

        return new QuestionSettings(
            minValue: minValue,
            maxValue: maxValue,
            minLabel: minLabel,
            maxLabel: maxLabel
        );
    }

    /// <summary>
    /// Creates settings for matrix questions.
    /// </summary>
    public static QuestionSettings CreateMatrixSettings(
        IReadOnlyList<string> rows,
        IReadOnlyList<string> columns
    )
    {
        if (rows == null || rows.Count == 0)
            throw new ArgumentException("Matrix rows cannot be empty.", nameof(rows));

        if (columns == null || columns.Count == 0)
            throw new ArgumentException("Matrix columns cannot be empty.", nameof(columns));

        return new QuestionSettings(matrixRows: rows, matrixColumns: columns);
    }

    /// <summary>
    /// Creates settings for file upload questions.
    /// </summary>
    public static QuestionSettings CreateFileUploadSettings(
        IReadOnlyList<string>? allowedFileTypes = null,
        long? maxFileSize = null
    )
    {
        return new QuestionSettings(allowedFileTypes: allowedFileTypes, maxFileSize: maxFileSize);
    }

    /// <summary>
    /// Creates settings for text questions.
    /// </summary>
    public static QuestionSettings CreateTextSettings(
        string? placeholder = null,
        int? maxLength = null
    )
    {
        return new QuestionSettings(placeholder: placeholder, maxLength: maxLength);
    }

    /// <summary>
    /// Creates settings for validated text questions (email, phone, URL).
    /// </summary>
    public static QuestionSettings CreateValidatedTextSettings(
        string? placeholder = null,
        int? maxLength = null,
        string? validationPreset = null,
        string? validationMessage = null,
        string? validationPattern = null
    )
    {
        return new QuestionSettings(
            placeholder: placeholder,
            maxLength: maxLength,
            validationPreset: validationPreset,
            validationMessage: validationMessage,
            validationPattern: validationPattern
        );
    }

    /// <summary>
    /// Creates settings for multiple choice questions (alias for CreateChoiceSettings).
    /// </summary>
    public static QuestionSettings ForMultipleChoice(
        IReadOnlyList<string> options,
        bool allowMultiple = false,
        int? maxSelections = null
    )
    {
        return new QuestionSettings(
            options: options,
            allowOther: false,
            maxSelections: maxSelections
        );
    }

    /// <summary>
    /// Creates settings for rating questions (alias for CreateRatingSettings).
    /// </summary>
    public static QuestionSettings ForRating(int minValue = 1, int maxValue = 5)
    {
        return CreateRatingSettings(minValue, maxValue);
    }

    /// <summary>
    /// Creates settings for text questions (alias for CreateTextSettings).
    /// </summary>
    public static QuestionSettings ForText(string? placeholder = null, int? maxLength = null)
    {
        return CreateTextSettings(placeholder, maxLength);
    }

    /// <summary>
    /// Creates settings for date questions.
    /// </summary>
    public static QuestionSettings ForDate()
    {
        return new QuestionSettings();
    }

    /// <summary>
    /// Creates settings for file upload questions (alias for CreateFileUploadSettings).
    /// </summary>
    public static QuestionSettings ForFileUpload(
        IReadOnlyList<string>? allowedFileTypes = null,
        long? maxFileSize = null
    )
    {
        return CreateFileUploadSettings(allowedFileTypes, maxFileSize);
    }

    /// <summary>
    /// Serializes the settings to a JSON string.
    /// </summary>
    public string ToJson()
    {
        return JsonSerializer.Serialize(
            new
            {
                Options,
                MinValue,
                MaxValue,
                MinLabel,
                MaxLabel,
                AllowedFileTypes,
                MaxFileSize,
                MatrixRows,
                MatrixColumns,
                Placeholder,
                AllowOther,
                MaxLength,
                ValidationPattern,
                ValidationMessage,
                ValidationPreset,
                RatingStyle,
                YesNoStyle,
            },
            new JsonSerializerOptions
            {
                DefaultIgnoreCondition = System
                    .Text
                    .Json
                    .Serialization
                    .JsonIgnoreCondition
                    .WhenWritingNull,
            }
        );
    }

    /// <summary>
    /// Deserializes settings from a JSON string.
    /// </summary>
    public static QuestionSettings FromJson(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return new QuestionSettings();

        try
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            return new QuestionSettings(
                options: GetStringArray(root, "Options"),
                minValue: GetNullableInt(root, "MinValue"),
                maxValue: GetNullableInt(root, "MaxValue"),
                minLabel: GetNullableString(root, "MinLabel"),
                maxLabel: GetNullableString(root, "MaxLabel"),
                allowedFileTypes: GetStringArray(root, "AllowedFileTypes"),
                maxFileSize: GetNullableLong(root, "MaxFileSize"),
                matrixRows: GetStringArray(root, "MatrixRows"),
                matrixColumns: GetStringArray(root, "MatrixColumns"),
                placeholder: GetNullableString(root, "Placeholder"),
                allowOther: GetNullableBool(root, "AllowOther") ?? false,
                maxLength: GetNullableInt(root, "MaxLength"),
                validationPattern: GetNullableString(root, "ValidationPattern"),
                validationMessage: GetNullableString(root, "ValidationMessage"),
                validationPreset: GetNullableString(root, "ValidationPreset"),
                ratingStyle: GetNullableEnum<RatingStyle>(root, "RatingStyle"),
                yesNoStyle: GetNullableEnum<YesNoStyle>(root, "YesNoStyle")
            );
        }
        catch
        {
            return new QuestionSettings();
        }
    }

    /// <summary>
    /// Tries to get a property from JSON, checking both PascalCase and camelCase variants.
    /// This handles the mismatch between frontend (camelCase) and backend (PascalCase) property names.
    /// </summary>
    private static bool TryGetPropertyCaseInsensitive(
        JsonElement root,
        string propertyName,
        out JsonElement element
    )
    {
        // Try PascalCase first (e.g., "YesNoStyle")
        if (root.TryGetProperty(propertyName, out element))
        {
            return true;
        }

        // Try camelCase (e.g., "yesNoStyle")
        var camelCase = char.ToLowerInvariant(propertyName[0]) + propertyName[1..];
        if (root.TryGetProperty(camelCase, out element))
        {
            return true;
        }

        element = default;
        return false;
    }

    private static List<string>? GetStringArray(JsonElement root, string propertyName)
    {
        if (
            TryGetPropertyCaseInsensitive(root, propertyName, out var element)
            && element.ValueKind == JsonValueKind.Array
        )
        {
            return element
                .EnumerateArray()
                .Where(e => e.ValueKind == JsonValueKind.String)
                .Select(e => e.GetString()!)
                .ToList();
        }
        return null;
    }

    private static int? GetNullableInt(JsonElement root, string propertyName)
    {
        if (
            TryGetPropertyCaseInsensitive(root, propertyName, out var element)
            && element.ValueKind == JsonValueKind.Number
        )
        {
            return element.GetInt32();
        }
        return null;
    }

    private static long? GetNullableLong(JsonElement root, string propertyName)
    {
        if (
            TryGetPropertyCaseInsensitive(root, propertyName, out var element)
            && element.ValueKind == JsonValueKind.Number
        )
        {
            return element.GetInt64();
        }
        return null;
    }

    private static string? GetNullableString(JsonElement root, string propertyName)
    {
        if (
            TryGetPropertyCaseInsensitive(root, propertyName, out var element)
            && element.ValueKind == JsonValueKind.String
        )
        {
            return element.GetString();
        }
        return null;
    }

    private static bool? GetNullableBool(JsonElement root, string propertyName)
    {
        if (TryGetPropertyCaseInsensitive(root, propertyName, out var element))
        {
            return element.ValueKind switch
            {
                JsonValueKind.True => true,
                JsonValueKind.False => false,
                _ => null,
            };
        }
        return null;
    }

    private static TEnum? GetNullableEnum<TEnum>(JsonElement root, string propertyName)
        where TEnum : struct, Enum
    {
        if (TryGetPropertyCaseInsensitive(root, propertyName, out var element))
        {
            if (
                element.ValueKind == JsonValueKind.Number
                && Enum.IsDefined(typeof(TEnum), element.GetInt32())
            )
            {
                return (TEnum)Enum.ToObject(typeof(TEnum), element.GetInt32());
            }
            if (
                element.ValueKind == JsonValueKind.String
                && Enum.TryParse<TEnum>(element.GetString(), true, out var result)
            )
            {
                return result;
            }
        }
        return null;
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Options != null ? string.Join(",", Options) : null;
        yield return MinValue;
        yield return MaxValue;
        yield return MinLabel;
        yield return MaxLabel;
        yield return AllowedFileTypes != null ? string.Join(",", AllowedFileTypes) : null;
        yield return MaxFileSize;
        yield return MatrixRows != null ? string.Join(",", MatrixRows) : null;
        yield return MatrixColumns != null ? string.Join(",", MatrixColumns) : null;
        yield return Placeholder;
        yield return AllowOther;
        yield return MaxLength;
        yield return ValidationPattern;
        yield return ValidationMessage;
        yield return ValidationPreset;
        yield return RatingStyle;
        yield return YesNoStyle;
    }
}
