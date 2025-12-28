using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Translations.Commands.BulkUpdateSurveyTranslations;

/// <summary>
/// Handler for bulk updating survey translations.
/// </summary>
public class BulkUpdateSurveyTranslationsCommandHandler(
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    INamespaceContext namespaceContext
) : IRequestHandler<BulkUpdateSurveyTranslationsCommand, Result<BulkTranslationResultDto>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceContext _namespaceContext = namespaceContext;

    public async Task<Result<BulkTranslationResultDto>> Handle(
        BulkUpdateSurveyTranslationsCommand request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<BulkTranslationResultDto>.Failure("Errors.NamespaceRequired");
        }

        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null)
        {
            return Result<BulkTranslationResultDto>.Failure("Errors.SurveyNotFound");
        }

        if (survey.NamespaceId != namespaceId.Value)
        {
            return Result<BulkTranslationResultDto>.Failure("Errors.SurveyNotFoundInNamespace");
        }

        var errors = new List<string>();
        var successCount = 0;
        string? newDefaultLanguage = null;

        // Find if there's a new default language specified
        var defaultTranslation = request.Translations.FirstOrDefault(t => t.IsDefault);
        if (defaultTranslation != null)
        {
            newDefaultLanguage = defaultTranslation.LanguageCode;
        }

        foreach (var translation in request.Translations)
        {
            try
            {
                survey.AddOrUpdateTranslation(
                    translation.LanguageCode,
                    translation.Title,
                    translation.Description,
                    translation.WelcomeMessage,
                    translation.ThankYouMessage
                );
                successCount++;
            }
            catch (Exception ex)
            {
                errors.Add($"Failed to update '{translation.LanguageCode}': {ex.Message}");
            }
        }

        // Set new default if specified
        if (!string.IsNullOrEmpty(newDefaultLanguage))
        {
            try
            {
                survey.SetDefaultTranslation(newDefaultLanguage);
            }
            catch (Exception ex)
            {
                errors.Add($"Failed to set default language '{newDefaultLanguage}': {ex.Message}");
            }
        }

        _surveyRepository.Update(survey);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<BulkTranslationResultDto>.Success(
            new BulkTranslationResultDto
            {
                TotalProcessed = request.Translations.Count,
                SuccessCount = successCount,
                FailureCount = errors.Count,
                Errors = errors,
                Languages = survey.GetAvailableLanguages().ToList(),
            }
        );
    }
}
