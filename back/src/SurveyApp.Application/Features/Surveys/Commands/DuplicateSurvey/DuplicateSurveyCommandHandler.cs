using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Application.Features.Surveys.Commands.DuplicateSurvey;

/// <summary>
/// Handler for duplicating an existing survey.
/// Creates a new draft survey with all questions, settings, and translations.
/// </summary>
public class DuplicateSurveyCommandHandler(
    ISurveyRepository surveyRepository,
    INamespaceRepository namespaceRepository,
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService,
    INamespaceContext namespaceContext,
    IMapper mapper
) : IRequestHandler<DuplicateSurveyCommand, Result<SurveyDto>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<SurveyDto>> Handle(
        DuplicateSurveyCommand request,
        CancellationToken cancellationToken
    )
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<SurveyDto>.Unauthorized("Errors.UserNotAuthenticated");
        }

        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<SurveyDto>.Failure("Errors.NamespaceRequired");
        }

        // Get the original survey with all data including questions
        var original = await _surveyRepository.GetByIdWithQuestionsAsync(
            request.SurveyId,
            cancellationToken
        );
        if (original == null)
        {
            return Result<SurveyDto>.NotFound($"Errors.EntityNotFound|Survey|{request.SurveyId}");
        }

        // Verify the survey belongs to the current namespace
        if (original.NamespaceId != namespaceId.Value)
        {
            return Result<SurveyDto>.Failure("Errors.SurveyNotInNamespace");
        }

        // Check permission to create surveys
        var @namespace = await _namespaceRepository.GetByIdAsync(
            namespaceId.Value,
            cancellationToken
        );
        var membership = @namespace?.Memberships.FirstOrDefault(m => m.UserId == userId.Value);
        if (membership == null || !membership.HasPermission(NamespacePermission.CreateSurveys))
        {
            return Result<SurveyDto>.Forbidden("Errors.NoPermissionCreateSurveys");
        }

        // Check survey limits
        if (@namespace != null && !@namespace.CanCreateSurvey())
        {
            return Result<SurveyDto>.Failure($"Errors.SurveyLimitReached|{@namespace.MaxSurveys}");
        }

        // Generate the new title
        var defaultTranslation = original.Translations.FirstOrDefault(t =>
            t.LanguageCode.Equals(original.DefaultLanguage, StringComparison.OrdinalIgnoreCase)
        );
        var originalTitle = defaultTranslation?.Title ?? "Untitled Survey";
        var newTitle = request.NewTitle ?? $"{originalTitle} (Copy)";

        // Create the new survey as a draft
        var newSurvey = Survey.Create(
            namespaceId.Value,
            newTitle,
            userId.Value,
            original.Type,
            original.CxMetricType,
            original.DefaultLanguage,
            defaultTranslation?.Description,
            defaultTranslation?.WelcomeMessage,
            defaultTranslation?.ThankYouMessage
        );

        // Copy settings using the ConfigureResponseSettings method
        newSurvey.ConfigureResponseSettings(
            original.AllowAnonymousResponses,
            original.AllowMultipleResponses,
            original.MaxResponses
        );

        // Copy theme settings using SetTheme
        newSurvey.SetTheme(original.ThemeId, original.PresetThemeId, original.ThemeCustomizations);

        // Copy additional translations (excluding default which was already created)
        foreach (
            var translation in original.Translations.Where(t =>
                !t.LanguageCode.Equals(original.DefaultLanguage, StringComparison.OrdinalIgnoreCase)
            )
        )
        {
            newSurvey.AddOrUpdateTranslation(
                translation.LanguageCode,
                request.NewTitle ?? $"{translation.Title} (Copy)",
                translation.Description,
                translation.WelcomeMessage,
                translation.ThankYouMessage
            );
        }

        // Copy questions in order
        foreach (var originalQuestion in original.Questions.OrderBy(q => q.Order))
        {
            // Get the default translation for the question
            var questionDefaultTranslation = originalQuestion.Translations.FirstOrDefault(t =>
                t.LanguageCode.Equals(original.DefaultLanguage, StringComparison.OrdinalIgnoreCase)
            );

            var newQuestion = newSurvey.AddQuestion(
                questionDefaultTranslation?.Text ?? string.Empty,
                originalQuestion.Type,
                originalQuestion.IsRequired,
                original.DefaultLanguage
            );

            // Copy question description
            if (!string.IsNullOrEmpty(questionDefaultTranslation?.Description))
            {
                newQuestion.UpdateDescription(
                    questionDefaultTranslation.Description,
                    original.DefaultLanguage
                );
            }

            // Copy question settings
            if (!string.IsNullOrEmpty(originalQuestion.SettingsJson))
            {
                var settings = QuestionSettings.FromJson(originalQuestion.SettingsJson);
                if (settings != null)
                {
                    newQuestion.UpdateSettings(settings);
                }
            }

            // Copy NPS configuration
            if (originalQuestion.IsNpsQuestion && originalQuestion.NpsType.HasValue)
            {
                newQuestion.SetAsNpsQuestion(originalQuestion.NpsType.Value);
            }

            // Copy additional question translations
            foreach (
                var qTranslation in originalQuestion.Translations.Where(t =>
                    !t.LanguageCode.Equals(
                        original.DefaultLanguage,
                        StringComparison.OrdinalIgnoreCase
                    )
                )
            )
            {
                newQuestion.UpdateText(qTranslation.Text, qTranslation.LanguageCode);
                if (!string.IsNullOrEmpty(qTranslation.Description))
                {
                    newQuestion.UpdateDescription(
                        qTranslation.Description,
                        qTranslation.LanguageCode
                    );
                }
            }
        }

        await _surveyRepository.AddAsync(newSurvey, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<SurveyDto>(newSurvey);
        return Result<SurveyDto>.Success(dto);
    }
}
