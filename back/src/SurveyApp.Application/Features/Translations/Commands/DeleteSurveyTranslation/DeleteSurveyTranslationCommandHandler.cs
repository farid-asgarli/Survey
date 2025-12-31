using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Translations.Commands.DeleteSurveyTranslation;

/// <summary>
/// Handler for deleting a survey translation.
/// </summary>
public class DeleteSurveyTranslationCommandHandler(
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    INamespaceContext namespaceContext
) : IRequestHandler<DeleteSurveyTranslationCommand, Result>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceContext _namespaceContext = namespaceContext;

    public async Task<Result> Handle(
        DeleteSurveyTranslationCommand request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result.Failure("Errors.NamespaceRequired");
        }

        // Load survey with questions (for cascade deletion of question translations)
        var survey = await _surveyRepository.GetByIdWithQuestionsAsync(
            request.SurveyId,
            cancellationToken
        );
        if (survey == null)
        {
            return Result.Failure("Errors.SurveyNotFound");
        }

        if (survey.NamespaceId != namespaceId.Value)
        {
            return Result.Failure("Errors.SurveyNotFoundInNamespace");
        }

        // Cannot delete the default language
        if (survey.DefaultLanguage.Equals(request.LanguageCode, StringComparison.OrdinalIgnoreCase))
        {
            return Result.Failure("Errors.CannotDeleteDefaultLanguage");
        }

        // Check if translation exists
        var translation = survey.GetTranslation(request.LanguageCode);
        if (translation == null)
        {
            return Result.Failure("Errors.TranslationNotFound");
        }

        // Remove the translation
        survey.RemoveTranslation(request.LanguageCode);

        // Save changes
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
