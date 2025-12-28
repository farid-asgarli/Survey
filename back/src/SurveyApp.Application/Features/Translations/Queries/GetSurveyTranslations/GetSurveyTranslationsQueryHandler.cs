using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.Features.Translations.Commands.BulkUpdateSurveyTranslations;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Translations.Queries.GetSurveyTranslations;

/// <summary>
/// Handler for getting all translations for a survey.
/// </summary>
public class GetSurveyTranslationsQueryHandler(
    ISurveyRepository surveyRepository,
    INamespaceContext namespaceContext
) : IRequestHandler<GetSurveyTranslationsQuery, Result<SurveyTranslationsDto>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;

    public async Task<Result<SurveyTranslationsDto>> Handle(
        GetSurveyTranslationsQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<SurveyTranslationsDto>.Failure("Errors.NamespaceRequired");
        }

        var survey = await _surveyRepository.GetByIdWithQuestionsAsync(
            request.SurveyId,
            cancellationToken
        );

        if (survey == null)
        {
            return Result<SurveyTranslationsDto>.Failure("Errors.SurveyNotFound");
        }

        if (survey.NamespaceId != namespaceId.Value)
        {
            return Result<SurveyTranslationsDto>.Failure("Errors.SurveyNotFoundInNamespace");
        }

        var surveyTranslations = survey
            .Translations.Select(t => new SurveyTranslationDto
            {
                LanguageCode = t.LanguageCode,
                Title = t.Title,
                Description = t.Description,
                WelcomeMessage = t.WelcomeMessage,
                ThankYouMessage = t.ThankYouMessage,
                IsDefault = t.LanguageCode.Equals(
                    survey.DefaultLanguage,
                    StringComparison.OrdinalIgnoreCase
                ),
            })
            .ToList();

        var questionTranslations = survey
            .Questions.OrderBy(q => q.Order)
            .Select(q => new QuestionTranslationsDto
            {
                QuestionId = q.Id,
                Order = q.Order,
                DefaultLanguage = q.DefaultLanguage,
                Translations = q
                    .Translations.Select(t => new QuestionTranslationItemDto
                    {
                        LanguageCode = t.LanguageCode,
                        Text = t.Text,
                        Description = t.Description,
                        IsDefault = t.LanguageCode.Equals(
                            q.DefaultLanguage,
                            StringComparison.OrdinalIgnoreCase
                        ),
                    })
                    .ToList(),
            })
            .ToList();

        return Result<SurveyTranslationsDto>.Success(
            new SurveyTranslationsDto
            {
                SurveyId = survey.Id,
                DefaultLanguage = survey.DefaultLanguage,
                Translations = surveyTranslations,
                Questions = questionTranslations,
            }
        );
    }
}
