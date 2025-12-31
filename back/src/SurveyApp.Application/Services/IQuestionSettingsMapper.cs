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
    /// </summary>
    /// <param name="dto">The question settings DTO.</param>
    /// <returns>The QuestionSettings value object, or null if the DTO is null.</returns>
    QuestionSettings? MapToSettings(QuestionSettingsDto? dto);
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
        {
            return null;
        }

        // Serialize the DTO to JSON and then deserialize it using QuestionSettings.FromJson
        // This ensures all properties including RatingStyle and YesNoStyle are preserved
        var json = System.Text.Json.JsonSerializer.Serialize(dto);
        return QuestionSettings.FromJson(json);
    }
}
