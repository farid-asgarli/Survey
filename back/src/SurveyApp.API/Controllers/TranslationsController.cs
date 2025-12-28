using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.API.Extensions;
using SurveyApp.Application.Features.Translations.Commands.BulkUpdateSurveyTranslations;
using SurveyApp.Application.Features.Translations.Queries.GetSurveyTranslations;

namespace SurveyApp.API.Controllers;

/// <summary>
/// Controller for managing translations of surveys and related entities.
/// </summary>
[ApiController]
[Route("api/surveys/{surveyId:guid}/translations")]
[Authorize]
public class TranslationsController(IMediator mediator) : ControllerBase
{
    private readonly IMediator _mediator = mediator;

    /// <summary>
    /// Get all translations for a survey including its questions.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <returns>All translations for the survey and its questions.</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTranslations(Guid surveyId)
    {
        var result = await _mediator.Send(new GetSurveyTranslationsQuery { SurveyId = surveyId });

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Bulk update all translations for a survey.
    /// This allows managing all language versions of a survey at once.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="translations">The translations to add or update.</param>
    /// <returns>Result of the bulk update operation.</returns>
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> BulkUpdateTranslations(
        Guid surveyId,
        [FromBody] BulkUpdateTranslationsRequest request
    )
    {
        var result = await _mediator.Send(
            new BulkUpdateSurveyTranslationsCommand
            {
                SurveyId = surveyId,
                Translations = request.Translations,
            }
        );

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }

    /// <summary>
    /// Add or update a single translation for a survey.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="languageCode">The language code (e.g., "es", "fr").</param>
    /// <param name="translation">The translation content.</param>
    /// <returns>Result of the update operation.</returns>
    [HttpPut("{languageCode}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTranslation(
        Guid surveyId,
        string languageCode,
        [FromBody] SurveyTranslationDto translation
    )
    {
        // Ensure the language code matches
        translation.LanguageCode = languageCode;

        var result = await _mediator.Send(
            new BulkUpdateSurveyTranslationsCommand
            {
                SurveyId = surveyId,
                Translations = [translation],
            }
        );

        if (!result.IsSuccess)
            return result.ToProblemDetails(HttpContext);

        return Ok(result.Value);
    }
}

/// <summary>
/// Request model for bulk updating translations.
/// </summary>
public class BulkUpdateTranslationsRequest
{
    /// <summary>
    /// The translations to add or update.
    /// </summary>
    public IReadOnlyList<SurveyTranslationDto> Translations { get; set; } = [];
}
