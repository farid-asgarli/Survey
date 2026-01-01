using SurveyApp.Application.DTOs;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Application.Services;

/// <summary>
/// Service for mapping question settings DTOs to domain value objects.
/// Centralizes the logic for creating QuestionSettings from DTOs.
/// </summary>
public interface IQuestionSettingsMapper
{
    /// <summary>
    /// Creates a QuestionSettings value object from a DTO.
    /// Generates new IDs for options that don't have valid IDs.
    /// </summary>
    /// <param name="dto">The question settings DTO.</param>
    /// <returns>The QuestionSettings value object, or null if the DTO is null.</returns>
    QuestionSettings? MapToSettings(QuestionSettingsDto? dto);

    /// <summary>
    /// Creates a QuestionSettings value object from a DTO, preserving existing option IDs.
    /// Use this when updating existing questions where option IDs must be preserved.
    /// </summary>
    /// <param name="dto">The question settings DTO.</param>
    /// <param name="existingSettings">Existing settings to preserve option IDs from.</param>
    /// <returns>The QuestionSettings value object, or null if the DTO is null.</returns>
    QuestionSettings? MapToSettingsPreservingIds(
        QuestionSettingsDto? dto,
        QuestionSettings? existingSettings
    );
}

/// <summary>
/// Default implementation of IQuestionSettingsMapper.
/// </summary>
public class QuestionSettingsMapper : IQuestionSettingsMapper
{
    /// <inheritdoc />
    public QuestionSettings? MapToSettings(QuestionSettingsDto? dto)
    {
        if (dto == null)
            return null;

        // Map options with ID generation for new options (empty GUID)
        IReadOnlyList<QuestionOption>? options = null;
        if (dto.Options != null && dto.Options.Count > 0)
        {
            options =
            [
                .. dto.Options.Select(
                    (o, index) =>
                        o.Id == Guid.Empty
                            ? QuestionOption.Create(o.Text, o.Order > 0 ? o.Order : index)
                            : QuestionOption.Restore(o.Id, o.Text, o.Order > 0 ? o.Order : index)
                ),
            ];
        }

        return QuestionSettings.FromDto(
            options: options,
            minValue: dto.MinValue,
            maxValue: dto.MaxValue,
            minLabel: dto.MinLabel,
            maxLabel: dto.MaxLabel,
            allowedFileTypes: dto.AllowedFileTypes?.ToList(),
            maxFileSize: dto.MaxFileSize,
            matrixRows: dto.MatrixRows?.ToList(),
            matrixColumns: dto.MatrixColumns?.ToList(),
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

    /// <inheritdoc />
    public QuestionSettings? MapToSettingsPreservingIds(
        QuestionSettingsDto? dto,
        QuestionSettings? existingSettings
    )
    {
        if (dto == null)
            return null;

        // Build a lookup of existing options by text (fallback) and by ID
        var existingOptionsById =
            existingSettings?.Options?.ToDictionary(o => o.Id)
            ?? new Dictionary<Guid, QuestionOption>();
        var existingOptionsByText =
            existingSettings?.Options?.ToDictionary(o => o.Text, StringComparer.OrdinalIgnoreCase)
            ?? new Dictionary<string, QuestionOption>();

        // Map options, preserving IDs where possible
        IReadOnlyList<QuestionOption>? options = null;
        if (dto.Options != null && dto.Options.Count > 0)
        {
            options =
            [
                .. dto.Options.Select(
                    (o, index) =>
                    {
                        var order = o.Order > 0 ? o.Order : index;

                        // If ID is provided and valid, use it
                        if (o.Id != Guid.Empty && existingOptionsById.ContainsKey(o.Id))
                            return QuestionOption.Restore(o.Id, o.Text, order);

                        // If ID is provided but not in existing (new option), generate new ID
                        if (o.Id != Guid.Empty)
                            return QuestionOption.Create(o.Text, order);

                        // If no ID but text matches existing option, preserve that ID
                        if (existingOptionsByText.TryGetValue(o.Text, out var existingOption))
                            return existingOption.WithOrder(order);

                        // New option - generate new ID
                        return QuestionOption.Create(o.Text, order);
                    }
                ),
            ];
        }

        return QuestionSettings.FromDto(
            options: options,
            minValue: dto.MinValue,
            maxValue: dto.MaxValue,
            minLabel: dto.MinLabel,
            maxLabel: dto.MaxLabel,
            allowedFileTypes: dto.AllowedFileTypes?.ToList(),
            maxFileSize: dto.MaxFileSize,
            matrixRows: dto.MatrixRows?.ToList(),
            matrixColumns: dto.MatrixColumns?.ToList(),
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
}
