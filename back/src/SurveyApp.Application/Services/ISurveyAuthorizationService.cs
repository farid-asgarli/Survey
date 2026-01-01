using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Services;

/// <summary>
/// Service for centralizing survey authorization and validation logic.
/// Reduces duplication of survey existence, namespace ownership, and status checks across handlers.
/// </summary>
public interface ISurveyAuthorizationService
{
    /// <summary>
    /// Validates that a survey exists and belongs to the current namespace.
    /// </summary>
    /// <param name="surveyId">The survey ID to validate.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Result containing the survey if valid, or a failure result.</returns>
    Task<Result<Survey>> ValidateSurveyAccessAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Validates that a survey exists, belongs to the current namespace, and is in draft status (editable).
    /// </summary>
    /// <param name="surveyId">The survey ID to validate.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Result containing the survey if valid, or a failure result.</returns>
    Task<Result<Survey>> ValidateSurveyEditableAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Validates that a survey with questions exists, belongs to the current namespace.
    /// </summary>
    /// <param name="surveyId">The survey ID to validate.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Result containing the survey with questions if valid, or a failure result.</returns>
    Task<Result<Survey>> ValidateSurveyWithQuestionsAccessAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Validates that a survey with questions exists, belongs to the current namespace, and is editable.
    /// </summary>
    /// <param name="surveyId">The survey ID to validate.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Result containing the survey with questions if valid, or a failure result.</returns>
    Task<Result<Survey>> ValidateSurveyWithQuestionsEditableAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Validates that a survey with questions exists (for update), belongs to the current namespace, and is editable.
    /// </summary>
    /// <param name="surveyId">The survey ID to validate.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Result containing the survey with questions if valid, or a failure result.</returns>
    Task<Result<Survey>> ValidateSurveyWithQuestionsForUpdateEditableAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    );
}

/// <summary>
/// Default implementation of ISurveyAuthorizationService.
/// </summary>
public class SurveyAuthorizationService(
    ISurveyRepository surveyRepository,
    INamespaceCommandContext commandContext
) : ISurveyAuthorizationService
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceCommandContext _commandContext = commandContext;

    /// <inheritdoc />
    public async Task<Result<Survey>> ValidateSurveyAccessAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    )
    {
        var ctx = _commandContext.Context;
        if (ctx == null)
        {
            return Result<Survey>.Failure("Errors.NamespaceRequired");
        }

        var survey = await _surveyRepository.GetByIdAsync(surveyId, cancellationToken);
        if (survey == null || survey.NamespaceId != ctx.NamespaceId)
        {
            return Result<Survey>.Failure("Errors.SurveyNotFound");
        }

        return Result<Survey>.Success(survey);
    }

    /// <inheritdoc />
    public async Task<Result<Survey>> ValidateSurveyEditableAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    )
    {
        var result = await ValidateSurveyAccessAsync(surveyId, cancellationToken);
        if (!result.IsSuccess)
        {
            return result;
        }

        var survey = result.Value!;
        if (survey.Status != SurveyStatus.Draft)
        {
            return Result<Survey>.Failure("Errors.OnlyDraftSurveysEditable");
        }

        return Result<Survey>.Success(survey);
    }

    /// <inheritdoc />
    public async Task<Result<Survey>> ValidateSurveyWithQuestionsAccessAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    )
    {
        var ctx = _commandContext.Context;
        if (ctx == null)
        {
            return Result<Survey>.Failure("Errors.NamespaceRequired");
        }

        var survey = await _surveyRepository.GetByIdWithQuestionsAsync(surveyId, cancellationToken);
        if (survey == null || survey.NamespaceId != ctx.NamespaceId)
        {
            return Result<Survey>.Failure("Errors.SurveyNotFound");
        }

        return Result<Survey>.Success(survey);
    }

    /// <inheritdoc />
    public async Task<Result<Survey>> ValidateSurveyWithQuestionsEditableAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    )
    {
        var result = await ValidateSurveyWithQuestionsAccessAsync(surveyId, cancellationToken);
        if (!result.IsSuccess)
        {
            return result;
        }

        var survey = result.Value!;
        if (survey.Status != SurveyStatus.Draft)
        {
            return Result<Survey>.Failure("Errors.OnlyDraftSurveysEditable");
        }

        return Result<Survey>.Success(survey);
    }

    /// <inheritdoc />
    public async Task<Result<Survey>> ValidateSurveyWithQuestionsForUpdateEditableAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    )
    {
        var ctx = _commandContext.Context;
        if (ctx == null)
        {
            return Result<Survey>.Failure("Errors.NamespaceRequired");
        }

        var survey = await _surveyRepository.GetByIdWithQuestionsForUpdateAsync(
            surveyId,
            cancellationToken
        );
        if (survey == null || survey.NamespaceId != ctx.NamespaceId)
        {
            return Result<Survey>.Failure("Errors.SurveyNotFound");
        }

        if (survey.Status != SurveyStatus.Draft)
        {
            return Result<Survey>.Failure("Errors.OnlyDraftSurveysEditable");
        }

        return Result<Survey>.Success(survey);
    }
}
