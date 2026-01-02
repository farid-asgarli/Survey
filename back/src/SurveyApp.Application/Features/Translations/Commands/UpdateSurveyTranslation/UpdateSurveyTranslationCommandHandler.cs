using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Application.Features.Translations.Commands.UpdateSurveyTranslation;

/// <summary>
/// Handler for adding or updating a single survey translation.
/// </summary>
public class UpdateSurveyTranslationCommandHandler(
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    INamespaceContext namespaceContext
) : IRequestHandler<UpdateSurveyTranslationCommand, Result<SurveyTranslationDto>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceContext _namespaceContext = namespaceContext;

    public async Task<Result<SurveyTranslationDto>> Handle(
        UpdateSurveyTranslationCommand request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<SurveyTranslationDto>.Failure("Errors.NamespaceRequired");
        }

        // Validate language code
        if (!LanguageCode.IsSupported(request.LanguageCode))
        {
            return Result<SurveyTranslationDto>.Failure(
                $"Validation.LanguageCode.Unsupported:{request.LanguageCode}"
            );
        }

        // Load survey for update
        var survey = await _surveyRepository.GetByIdWithQuestionsForUpdateAsync(
            request.SurveyId,
            cancellationToken
        );

        if (survey == null)
        {
            return Result<SurveyTranslationDto>.NotFound("Errors.SurveyNotFound");
        }

        if (survey.NamespaceId != namespaceId.Value)
        {
            return Result<SurveyTranslationDto>.Failure("Errors.SurveyNotFoundInNamespace");
        }

        // Check if this is a new translation (need to track for EF)
        var existingLanguages = survey
            .GetAvailableLanguages()
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        var isNewTranslation = !existingLanguages.Contains(request.LanguageCode);

        // Add or update the translation
        survey.AddOrUpdateTranslation(
            request.LanguageCode,
            request.Title,
            request.Description,
            request.WelcomeMessage,
            request.ThankYouMessage
        );

        // If new translation, need to explicitly add to DbContext
        if (isNewTranslation)
        {
            var newTranslation = survey.GetTranslation(request.LanguageCode);
            if (newTranslation != null)
            {
                await _surveyRepository.AddTranslationAsync(newTranslation, cancellationToken);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Return the updated translation
        var updatedTranslation = survey.GetTranslation(request.LanguageCode);
        if (updatedTranslation == null)
        {
            return Result<SurveyTranslationDto>.Failure("Errors.TranslationUpdateFailed");
        }

        return Result<SurveyTranslationDto>.Success(
            new SurveyTranslationDto
            {
                LanguageCode = updatedTranslation.LanguageCode,
                Title = updatedTranslation.Title,
                Description = updatedTranslation.Description,
                WelcomeMessage = updatedTranslation.WelcomeMessage,
                ThankYouMessage = updatedTranslation.ThankYouMessage,
                IsDefault = updatedTranslation.LanguageCode.Equals(
                    survey.DefaultLanguage,
                    StringComparison.OrdinalIgnoreCase
                ),
            }
        );
    }
}
