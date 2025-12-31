using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Questions.Commands.CreateQuestion;

/// <summary>
/// Handler for creating a new question in a survey.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class CreateQuestionCommandHandler(
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    ISurveyAuthorizationService surveyAuthorizationService,
    IQuestionSettingsMapper questionSettingsMapper,
    IMapper mapper
) : IRequestHandler<CreateQuestionCommand, Result<QuestionDto>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly ISurveyAuthorizationService _surveyAuthorizationService =
        surveyAuthorizationService;
    private readonly IQuestionSettingsMapper _questionSettingsMapper = questionSettingsMapper;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<QuestionDto>> Handle(
        CreateQuestionCommand request,
        CancellationToken cancellationToken
    )
    {
        // Validate survey access and editability using centralized service
        var surveyResult =
            await _surveyAuthorizationService.ValidateSurveyWithQuestionsEditableAsync(
                request.SurveyId,
                cancellationToken
            );
        if (!surveyResult.IsSuccess)
        {
            return Result<QuestionDto>.Failure(surveyResult.Error!);
        }

        var survey = surveyResult.Value!;

        // Use provided language or survey's default language
        var languageCode = request.LanguageCode ?? survey.DefaultLanguage;

        // Add question with localized content
        var question = survey.AddQuestion(
            request.Text,
            request.Type,
            request.IsRequired,
            languageCode
        );

        // Update description if provided
        if (!string.IsNullOrEmpty(request.Description))
        {
            question.UpdateDescription(request.Description, languageCode);
        }

        // Handle order if specified
        if (request.Order.HasValue)
        {
            question.UpdateOrder(request.Order.Value);
        }

        // Handle settings if provided
        if (request.Settings != null)
        {
            var settings = _questionSettingsMapper.MapToSettings(request.Settings);
            if (settings != null)
            {
                question.UpdateSettings(settings);
            }
        }

        // Handle NPS designation
        if (request.IsNpsQuestion)
        {
            question.SetAsNpsQuestion(request.NpsType ?? NpsQuestionType.Standard);
        }

        // Explicitly add the question to the context for proper change tracking
        // This ensures EF Core marks the question as Added, not Modified
        await _surveyRepository.AddQuestionAsync(question, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<QuestionDto>(question);
        return Result<QuestionDto>.Success(dto);
    }
}
