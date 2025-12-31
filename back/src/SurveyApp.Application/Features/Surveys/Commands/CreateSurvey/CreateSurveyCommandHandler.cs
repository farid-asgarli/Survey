using AutoMapper;
using MediatR;
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
    INamespaceRepository namespaceRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext,
    IQuestionSettingsMapper questionSettingsMapper,
    IMapper mapper
) : IRequestHandler<CreateSurveyCommand, Result<SurveyDto>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;
    private readonly IQuestionSettingsMapper _questionSettingsMapper = questionSettingsMapper;
    private readonly IMapper _mapper = mapper;

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
            return Result<SurveyDto>.Failure(
                $"Survey limit reached for this namespace. Maximum allowed: {@namespace.MaxSurveys}"
            );
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
    private static void AddCxMetricQuestion(
        Survey survey,
        CxMetricType metricType,
        string languageCode
    )
    {
        var (questionText, minValue, maxValue, minLabel, maxLabel, followUpText) = metricType switch
        {
            CxMetricType.NPS => (
                "How likely are you to recommend us to a friend or colleague?",
                0,
                10,
                "Not at all likely",
                "Extremely likely",
                "What is the primary reason for your score?"
            ),
            CxMetricType.CES => (
                "How easy was it to interact with our company?",
                1,
                7,
                "Very difficult",
                "Very easy",
                "What could we do to make your experience easier?"
            ),
            CxMetricType.CSAT => (
                "How satisfied are you with your experience?",
                1,
                5,
                "Very dissatisfied",
                "Very satisfied",
                "What could we improve to better serve you?"
            ),
            _ => (
                "How likely are you to recommend us?",
                0,
                10,
                "Not at all likely",
                "Extremely likely",
                "What is the primary reason for your score?"
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
        followUpQuestion.UpdateDescription("Please share your thoughts", languageCode);
        var textSettings = QuestionSettings.CreateTextSettings("Share your feedback here...", 2000);
        followUpQuestion.UpdateSettings(textSettings);
    }
}
