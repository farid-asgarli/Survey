using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Domain.ValueObjects;

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

        // Load survey with questions for language sync - use tracking version for updates
        var survey = await _surveyRepository.GetByIdWithQuestionsForUpdateAsync(
            request.SurveyId,
            cancellationToken
        );
        if (survey == null)
        {
            return Result<BulkTranslationResultDto>.NotFound("Errors.SurveyNotFound");
        }

        if (survey.NamespaceId != namespaceId.Value)
        {
            return Result<BulkTranslationResultDto>.Failure("Errors.SurveyNotFoundInNamespace");
        }

        var errors = new List<string>();
        var successCount = 0;
        string? newDefaultLanguage = null;
        var newTranslations = new List<SurveyTranslation>();

        // Find if there's a new default language specified
        var defaultTranslation = request.Translations.FirstOrDefault(t => t.IsDefault);
        if (defaultTranslation != null)
        {
            newDefaultLanguage = defaultTranslation.LanguageCode;
        }

        // Get existing language codes to determine which are new
        var existingLanguages = survey
            .GetAvailableLanguages()
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var translation in request.Translations)
        {
            try
            {
                // Validate language code
                if (!LanguageCode.IsSupported(translation.LanguageCode))
                {
                    errors.Add($"Validation.LanguageCode.Unsupported:{translation.LanguageCode}");
                    continue;
                }

                survey.AddOrUpdateTranslation(
                    translation.LanguageCode,
                    translation.Title,
                    translation.Description,
                    translation.WelcomeMessage,
                    translation.ThankYouMessage
                );

                // Track new translations for explicit adding to DbContext
                if (!existingLanguages.Contains(translation.LanguageCode))
                {
                    var newTranslation = survey.GetTranslation(translation.LanguageCode);
                    if (newTranslation != null)
                    {
                        newTranslations.Add(newTranslation);
                    }
                }

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

        // Process question translations
        var questionTranslationSuccess = 0;
        var newQuestionTranslations = new List<QuestionTranslation>();
        if (request.QuestionTranslations != null && request.QuestionTranslations.Count > 0)
        {
            var questionsDict = survey.Questions.ToDictionary(q => q.Id);

            foreach (var qt in request.QuestionTranslations)
            {
                try
                {
                    if (!questionsDict.TryGetValue(qt.QuestionId, out var question))
                    {
                        errors.Add($"Errors.EntityNotFound|Question|{qt.QuestionId}");
                        continue;
                    }

                    // Check if this is a new translation
                    var existingQTranslation = question.Translations.FirstOrDefault(t =>
                        t.LanguageCode.Equals(qt.LanguageCode, StringComparison.OrdinalIgnoreCase)
                    );
                    var isNewQTranslation = existingQTranslation == null;

                    // Convert translated settings DTO to domain value object
                    var translatedSettings = qt.TranslatedSettings?.ToDomain();

                    // Add or update the question translation
                    var qTranslation = question.AddOrUpdateTranslation(
                        qt.LanguageCode,
                        qt.Text,
                        qt.Description,
                        translatedSettings
                    );

                    // Track new translations for explicit adding to DbContext
                    if (isNewQTranslation)
                    {
                        newQuestionTranslations.Add(qTranslation);
                    }

                    questionTranslationSuccess++;
                }
                catch (Exception ex)
                {
                    errors.Add(
                        $"Failed to update question '{qt.QuestionId}' for '{qt.LanguageCode}': {ex.Message}"
                    );
                }
            }
        }

        // Explicitly add new translations to DbContext for proper change tracking
        // This is necessary because adding to a tracked collection may not always
        // be detected as an 'Added' state by EF Core's change tracker
        foreach (var newTranslation in newTranslations)
        {
            await _surveyRepository.AddTranslationAsync(newTranslation, cancellationToken);
        }

        // Explicitly add new question translations to DbContext
        foreach (var newQTranslation in newQuestionTranslations)
        {
            await _surveyRepository.AddQuestionTranslationAsync(newQTranslation, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var totalProcessed =
            request.Translations.Count + (request.QuestionTranslations?.Count ?? 0);
        var totalSuccess = successCount + questionTranslationSuccess;

        return Result<BulkTranslationResultDto>.Success(
            new BulkTranslationResultDto
            {
                TotalProcessed = totalProcessed,
                SuccessCount = totalSuccess,
                FailureCount = errors.Count,
                Errors = errors,
                Languages = [.. survey.GetAvailableLanguages()],
                CompletionStatus = survey.GetTranslationCompletionStatus(),
            }
        );
    }
}
