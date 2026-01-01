using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SurveyApp.API.Models;
using SurveyApp.Application.Features.Translations.Commands.BulkUpdateSurveyTranslations;
using SurveyApp.Application.Features.Translations.Commands.DeleteSurveyTranslation;
using SurveyApp.Application.Features.Translations.Commands.UpdateSurveyTranslation;
using SurveyApp.Application.Features.Translations.Queries.GetSurveyTranslations;

namespace SurveyApp.API.Controllers;

/// <summary>
/// Controller for managing translations of surveys and related entities.
/// </summary>
[ApiController]
[Route("api/surveys/{surveyId:guid}/translations")]
[Authorize]
public class TranslationsController(IMediator mediator) : ApiControllerBase
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
        var result = await _mediator.Send(new GetSurveyTranslationsQuery(surveyId));
        return HandleResult(result);
    }

    /// <summary>
    /// Bulk update all translations for a survey (including question translations).
    /// This allows managing all language versions of a survey at once.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="command">The translations command.</param>
    /// <returns>Result of the bulk update operation.</returns>
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> BulkUpdateTranslations(
        Guid surveyId,
        [FromBody] BulkUpdateSurveyTranslationsCommand command
    )
    {
        var result = await _mediator.Send(command with { SurveyId = surveyId });

        return HandleResult(result);
    }

    /// <summary>
    /// Add or update a single translation for a survey.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="languageCode">The language code (e.g., "es", "fr").</param>
    /// <param name="request">The translation content.</param>
    /// <returns>The updated translation.</returns>
    [HttpPut("{languageCode}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTranslation(
        Guid surveyId,
        string languageCode,
        [FromBody] UpdateSurveyTranslationRequest request
    )
    {
        var result = await _mediator.Send(
            new UpdateSurveyTranslationCommand
            {
                SurveyId = surveyId,
                LanguageCode = languageCode,
                Title = request.Title,
                Description = request.Description,
                WelcomeMessage = request.WelcomeMessage,
                ThankYouMessage = request.ThankYouMessage,
            }
        );

        return HandleResult(result);
    }

    /// <summary>
    /// Delete a translation for a survey.
    /// </summary>
    /// <param name="surveyId">The survey ID.</param>
    /// <param name="languageCode">The language code to delete (e.g., "es", "fr").</param>
    /// <returns>No content on success.</returns>
    [HttpDelete("{languageCode}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTranslation(Guid surveyId, string languageCode)
    {
        var result = await _mediator.Send(
            new DeleteSurveyTranslationCommand { SurveyId = surveyId, LanguageCode = languageCode }
        );

        return HandleNoContentResult(result);
    }
}
