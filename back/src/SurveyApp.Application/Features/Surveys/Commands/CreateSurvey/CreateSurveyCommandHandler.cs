using AutoMapper;
using MediatR;
using Microsoft.Extensions.Localization;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Application.Features.Surveys.Commands.CreateSurvey;

/// <summary>
/// Handler for creating a new survey.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class CreateSurveyCommandHandler(
    ISurveyRepository surveyRepository,
    ISurveyCategoryRepository categoryRepository,
    INamespaceRepository namespaceRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext,
    IQuestionSettingsMapper questionSettingsMapper,
    IMapper mapper,
    IStringLocalizer<CreateSurveyCommandHandler> localizer
) : IRequestHandler<CreateSurveyCommand, Result<SurveyDto>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly ISurveyCategoryRepository _categoryRepository = categoryRepository;
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;
    private readonly IQuestionSettingsMapper _questionSettingsMapper = questionSettingsMapper;
    private readonly IMapper _mapper = mapper;
    private readonly IStringLocalizer<CreateSurveyCommandHandler> _localizer = localizer;

    public async Task<Result<SurveyDto>> Handle(
        CreateSurveyCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        // Load namespace to check limits
        var @namespace = await _namespaceRepository.GetByIdAsync(
            ctx.NamespaceId,
            cancellationToken
        );

        // Check survey limits
        if (@namespace != null && !@namespace.CanCreateSurvey())
        {
            return Result<SurveyDto>.Failure($"Errors.SurveyLimitReached|{@namespace.MaxSurveys}");
        }

        // Validate category if provided
        if (request.CategoryId.HasValue)
        {
            var category = await _categoryRepository.GetByIdAsync(
                request.CategoryId.Value,
                cancellationToken
            );
            if (category == null || category.NamespaceId != ctx.NamespaceId)
            {
                return Result<SurveyDto>.Failure("Errors.CategoryNotFound");
            }
        }

        // Create survey with type and localized content
        var survey = Survey.Create(
            ctx.NamespaceId,
            request.Title,
            ctx.UserId,
            request.Type,
            request.CxMetricType,
            request.LanguageCode,
            request.Description,
            request.WelcomeMessage,
            request.ThankYouMessage
        );

        // Set category if provided
        if (request.CategoryId.HasValue)
        {
            survey.SetCategory(request.CategoryId.Value);
        }

        if (request.IsAnonymous)
        {
            survey.SetAnonymous(true);
        }

        if (request.MaxResponses.HasValue)
        {
            survey.SetMaxResponses(request.MaxResponses.Value);
        }

        if (request.StartDate.HasValue || request.EndDate.HasValue)
        {
            survey.SetSchedule(request.StartDate, request.EndDate);
        }

        // Auto-create CX metric question for Customer Experience surveys
        if (
            request.Type == SurveyType.CustomerExperience
            && request.CxMetricType.HasValue
            && request.Questions.Count == 0
        )
        {
            AddCxMetricQuestion(survey, request.CxMetricType.Value, request.LanguageCode);
        }

        // Add questions
        foreach (var questionDto in request.Questions.OrderBy(q => q.Order))
        {
            var question = survey.AddQuestion(
                questionDto.Text,
                questionDto.Type,
                questionDto.IsRequired
            );

            // Update additional properties if needed
            if (!string.IsNullOrEmpty(questionDto.Description))
            {
                question.UpdateDescription(questionDto.Description);
            }

            if (questionDto.Settings != null)
            {
                var settings = _questionSettingsMapper.MapToSettings(questionDto.Settings);
                if (settings != null)
                {
                    question.UpdateSettings(settings);
                }
            }
        }

        await _surveyRepository.AddAsync(survey, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<SurveyDto>(survey);
        return Result<SurveyDto>.Success(dto);
    }

    /// <summary>
    /// Adds the appropriate CX metric question based on the metric type.
    /// Also adds a follow-up open-ended question for qualitative feedback.
    /// </summary>
    private void AddCxMetricQuestion(Survey survey, CxMetricType metricType, string languageCode)
    {
        var (questionText, minValue, maxValue, minLabel, maxLabel, followUpText) = metricType switch
        {
            CxMetricType.NPS => (
                _localizer["CxMetric.NPS.Question"].Value,
                0,
                10,
                _localizer["CxMetric.NPS.MinLabel"].Value,
                _localizer["CxMetric.NPS.MaxLabel"].Value,
                _localizer["CxMetric.NPS.FollowUp"].Value
            ),
            CxMetricType.CES => (
                _localizer["CxMetric.CES.Question"].Value,
                1,
                7,
                _localizer["CxMetric.CES.MinLabel"].Value,
                _localizer["CxMetric.CES.MaxLabel"].Value,
                _localizer["CxMetric.CES.FollowUp"].Value
            ),
            CxMetricType.CSAT => (
                _localizer["CxMetric.CSAT.Question"].Value,
                1,
                5,
                _localizer["CxMetric.CSAT.MinLabel"].Value,
                _localizer["CxMetric.CSAT.MaxLabel"].Value,
                _localizer["CxMetric.CSAT.FollowUp"].Value
            ),
            _ => (
                _localizer["CxMetric.NPS.Question"].Value,
                0,
                10,
                _localizer["CxMetric.NPS.MinLabel"].Value,
                _localizer["CxMetric.NPS.MaxLabel"].Value,
                _localizer["CxMetric.NPS.FollowUp"].Value
            ),
        };

        // Add main CX metric question with translation
        var mainQuestion = survey.AddQuestion(
            questionText,
            QuestionType.NPS,
            isRequired: true,
            languageCode: languageCode
        );
        var settings = QuestionSettings.CreateScaleSettings(minValue, maxValue, minLabel, maxLabel);
        mainQuestion.UpdateSettings(settings);

        // Add follow-up open-ended question with translation
        var followUpQuestion = survey.AddQuestion(
            followUpText,
            QuestionType.LongText,
            isRequired: false,
            languageCode: languageCode
        );
        followUpQuestion.UpdateDescription(
            _localizer["CxMetric.FollowUp.Description"].Value,
            languageCode
        );
        var textSettings = QuestionSettings.CreateTextSettings(
            _localizer["CxMetric.FollowUp.Placeholder"].Value,
            2000
        );
        followUpQuestion.UpdateSettings(textSettings);
    }
}
