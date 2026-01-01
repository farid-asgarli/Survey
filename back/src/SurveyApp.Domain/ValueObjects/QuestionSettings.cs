using System.Text.Json;
using SurveyApp.Domain.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Domain.ValueObjects;

/// <summary>
/// Question-specific settings as a value object.
/// </summary>
public sealed class QuestionSettings : ValueObject
{
    /// <summary>
    /// Options for choice-based questions (with stable IDs for aggregation).
    /// </summary>
    public IReadOnlyList<QuestionOption>? Options { get; }

    /// <summary>
    /// Minimum value for scale/rating questions.
    /// </summary>
    public int? MinValue { get; }

    /// <summary>
    /// Maximum value for scale/rating questions.
    /// </summary>
    public int? MaxValue { get; }

    /// <summary>
    /// Minimum label for scale questions.
    /// </summary>
    public string? MinLabel { get; }

    /// <summary>
    /// Maximum label for scale questions.
    /// </summary>
    public string? MaxLabel { get; }

    /// <summary>
    /// Allowed file types for file upload questions.
    /// </summary>
    public IReadOnlyList<string>? AllowedFileTypes { get; }

    /// <summary>
    /// Maximum file size in bytes for file upload questions.
    /// </summary>
    public long? MaxFileSize { get; }

    /// <summary>
    /// Rows for matrix questions.
    /// </summary>
    public IReadOnlyList<string>? MatrixRows { get; }

    /// <summary>
    /// Columns for matrix questions.
    /// </summary>
    public IReadOnlyList<string>? MatrixColumns { get; }

    /// <summary>
    /// Placeholder text for text questions.
    /// </summary>
    public string? Placeholder { get; }

    /// <summary>
    /// Whether 'Other' option is allowed.
    /// </summary>
    public bool AllowOther { get; }

    /// <summary>
    /// Maximum character length for text questions.
    /// </summary>
    public int? MaxLength { get; }

    /// <summary>
    /// Minimum character length for text questions.
    /// </summary>
    public int? MinLength { get; }

    /// <summary>
    /// Maximum selections for multiple choice questions.
    /// </summary>
    public int? MaxSelections { get; }

    /// <summary>
    /// Custom regex validation pattern.
    /// </summary>
    public string? ValidationPattern { get; }

    /// <summary>
    /// Custom error message when validation fails.
    /// </summary>
    public string? ValidationMessage { get; }

    /// <summary>
    /// Pre-defined validation pattern name.
    /// </summary>
    public string? ValidationPreset { get; }

    /// <summary>
    /// Visual style for rating questions.
    /// </summary>
    public RatingStyle? RatingStyle { get; }

    /// <summary>
    /// Visual style for yes/no questions.
    /// </summary>
    public YesNoStyle? YesNoStyle { get; }

    private QuestionSettings(
        IReadOnlyList<QuestionOption>? options = null,
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
    }

    #region Factory Methods

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
            ),
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

    public static QuestionSettings CreateChoiceSettings(
        IReadOnlyList<string> optionTexts,
        bool allowOther = false
    )
    {
        if (optionTexts == null || optionTexts.Count == 0)
            throw new DomainException("Domain.QuestionSettings.OptionsEmpty");

        var options = optionTexts.Select((text, i) => QuestionOption.Create(text, i)).ToList();
        return new QuestionSettings(options: options, allowOther: allowOther);
    }

    public static QuestionSettings CreateChoiceSettingsWithOptions(
        IReadOnlyList<QuestionOption> options,
        bool allowOther = false
    )
    {
        if (options == null || options.Count == 0)
            throw new DomainException("Domain.QuestionSettings.OptionsEmpty");

        return new QuestionSettings(options: options, allowOther: allowOther);
    }

    public static QuestionSettings CreateRatingSettings(
        int minValue = 1,
        int maxValue = 5,
        RatingStyle? style = null
    )
    {
        if (minValue >= maxValue)
            throw new DomainException("Domain.QuestionSettings.MaxGreaterThanMin");

        return new QuestionSettings(minValue: minValue, maxValue: maxValue, ratingStyle: style);
    }

    public static QuestionSettings CreateScaleSettings(
        int minValue,
        int maxValue,
        string? minLabel = null,
        string? maxLabel = null
    )
    {
        if (minValue >= maxValue)
            throw new DomainException("Domain.QuestionSettings.MaxGreaterThanMin");

        return new QuestionSettings(
            minValue: minValue,
            maxValue: maxValue,
            minLabel: minLabel,
            maxLabel: maxLabel
        );
    }

    public static QuestionSettings CreateMatrixSettings(
        IReadOnlyList<string> rows,
        IReadOnlyList<string> columns
    )
    {
        if (rows == null || rows.Count == 0)
            throw new DomainException("Domain.QuestionSettings.MatrixRowsEmpty");
        if (columns == null || columns.Count == 0)
            throw new DomainException("Domain.QuestionSettings.MatrixColumnsEmpty");

        return new QuestionSettings(matrixRows: rows, matrixColumns: columns);
    }

    public static QuestionSettings CreateFileUploadSettings(
        IReadOnlyList<string>? allowedFileTypes = null,
        long? maxFileSize = null
    )
    {
        return new QuestionSettings(allowedFileTypes: allowedFileTypes, maxFileSize: maxFileSize);
    }

    public static QuestionSettings CreateTextSettings(
        string? placeholder = null,
        int? maxLength = null
    )
    {
        return new QuestionSettings(placeholder: placeholder, maxLength: maxLength);
    }

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
    /// Creates QuestionSettings from DTO values. Use this when mapping from application layer.
    /// Unlike FromJson, this accepts pre-mapped QuestionOption instances.
    /// </summary>
    public static QuestionSettings FromDto(
        IReadOnlyList<QuestionOption>? options = null,
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
        return new QuestionSettings(
            options: options,
            minValue: minValue,
            maxValue: maxValue,
            minLabel: minLabel,
            maxLabel: maxLabel,
            allowedFileTypes: allowedFileTypes,
            maxFileSize: maxFileSize,
            matrixRows: matrixRows,
            matrixColumns: matrixColumns,
            placeholder: placeholder,
            allowOther: allowOther,
            maxLength: maxLength,
            minLength: minLength,
            maxSelections: maxSelections,
            validationPattern: validationPattern,
            validationMessage: validationMessage,
            validationPreset: validationPreset,
            ratingStyle: ratingStyle,
            yesNoStyle: yesNoStyle
        );
    }

    #endregion

    #region Option Helpers

    public QuestionOption? GetOption(Guid optionId) =>
        Options?.FirstOrDefault(o => o.Id == optionId);

    public bool IsValidOption(Guid optionId) => Options?.Any(o => o.Id == optionId) ?? false;

    public IEnumerable<QuestionOption> GetOptions(IEnumerable<Guid> optionIds)
    {
        if (Options == null)
            yield break;
        foreach (var id in optionIds)
        {
            var option = Options.FirstOrDefault(o => o.Id == id);
            if (option != null)
                yield return option;
        }
    }

    #endregion

    #region Serialization

    public string ToJson()
    {
        var dto = new SettingsJsonDto
        {
            Options = Options
                ?.Select(o => new OptionJsonDto
                {
                    Id = o.Id,
                    Text = o.Text,
                    Order = o.Order,
                })
                .ToList(),
            MinValue = MinValue,
            MaxValue = MaxValue,
            MinLabel = MinLabel,
            MaxLabel = MaxLabel,
            AllowedFileTypes = AllowedFileTypes?.ToList(),
            MaxFileSize = MaxFileSize,
            MatrixRows = MatrixRows?.ToList(),
            MatrixColumns = MatrixColumns?.ToList(),
            Placeholder = Placeholder,
            AllowOther = AllowOther,
            MaxLength = MaxLength,
            MinLength = MinLength,
            MaxSelections = MaxSelections,
            ValidationPattern = ValidationPattern,
            ValidationMessage = ValidationMessage,
            ValidationPreset = ValidationPreset,
            RatingStyle = RatingStyle,
            YesNoStyle = YesNoStyle,
        };

        return JsonSerializer.Serialize(dto, JsonOptions);
    }

    public static QuestionSettings FromJson(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return new QuestionSettings();

        try
        {
            var dto = JsonSerializer.Deserialize<SettingsJsonDto>(json, JsonOptions);
            if (dto == null)
                return new QuestionSettings();

            var options = dto
                .Options?.Select(o => QuestionOption.Restore(o.Id, o.Text, o.Order))
                .ToList();

            return new QuestionSettings(
                options: options,
                minValue: dto.MinValue,
                maxValue: dto.MaxValue,
                minLabel: dto.MinLabel,
                maxLabel: dto.MaxLabel,
                allowedFileTypes: dto.AllowedFileTypes,
                maxFileSize: dto.MaxFileSize,
                matrixRows: dto.MatrixRows,
                matrixColumns: dto.MatrixColumns,
                placeholder: dto.Placeholder,
                allowOther: dto.AllowOther,
                maxLength: dto.MaxLength,
                minLength: dto.MinLength,
                maxSelections: dto.MaxSelections,
                validationPattern: dto.ValidationPattern,
                validationMessage: dto.ValidationMessage,
                validationPreset: dto.ValidationPreset,
                ratingStyle: dto.RatingStyle,
                yesNoStyle: dto.YesNoStyle
            );
        }
        catch
        {
            return new QuestionSettings();
        }
    }

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
    };

    private class SettingsJsonDto
    {
        public List<OptionJsonDto>? Options { get; set; }
        public int? MinValue { get; set; }
        public int? MaxValue { get; set; }
        public string? MinLabel { get; set; }
        public string? MaxLabel { get; set; }
        public List<string>? AllowedFileTypes { get; set; }
        public long? MaxFileSize { get; set; }
        public List<string>? MatrixRows { get; set; }
        public List<string>? MatrixColumns { get; set; }
        public string? Placeholder { get; set; }
        public bool AllowOther { get; set; }
        public int? MaxLength { get; set; }
        public int? MinLength { get; set; }
        public int? MaxSelections { get; set; }
        public string? ValidationPattern { get; set; }
        public string? ValidationMessage { get; set; }
        public string? ValidationPreset { get; set; }
        public RatingStyle? RatingStyle { get; set; }
        public YesNoStyle? YesNoStyle { get; set; }
    }

    private class OptionJsonDto
    {
        public Guid Id { get; set; }
        public string Text { get; set; } = null!;
        public int Order { get; set; }
    }

    #endregion

    #region Translations

    public QuestionSettings WithTranslations(TranslatedQuestionSettings? translations)
    {
        if (translations == null)
            return this;

        // Update option texts while preserving IDs
        IReadOnlyList<QuestionOption>? translatedOptions = null;
        if (Options != null && translations.Options != null)
        {
            translatedOptions =
            [
                .. Options.Select(
                    (opt, i) =>
                        i < translations.Options.Count ? opt.WithText(translations.Options[i]) : opt
                ),
            ];
        }

        return new QuestionSettings(
            options: translatedOptions ?? Options,
            minValue: MinValue,
            maxValue: MaxValue,
            minLabel: translations.MinLabel ?? MinLabel,
            maxLabel: translations.MaxLabel ?? MaxLabel,
            allowedFileTypes: AllowedFileTypes,
            maxFileSize: MaxFileSize,
            matrixRows: translations.MatrixRows ?? MatrixRows,
            matrixColumns: translations.MatrixColumns ?? MatrixColumns,
            placeholder: translations.Placeholder ?? Placeholder,
            allowOther: AllowOther,
            maxLength: MaxLength,
            minLength: MinLength,
            maxSelections: MaxSelections,
            validationPattern: ValidationPattern,
            validationMessage: translations.ValidationMessage ?? ValidationMessage,
            validationPreset: ValidationPreset,
            ratingStyle: RatingStyle,
            yesNoStyle: YesNoStyle
        );
    }

    #endregion

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        if (Options != null)
            yield return string.Join(",", Options.Select(o => o.Id));
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
        yield return MinLength;
        yield return MaxSelections;
        yield return ValidationPattern;
        yield return ValidationMessage;
        yield return ValidationPreset;
        yield return RatingStyle;
        yield return YesNoStyle;
    }
}
