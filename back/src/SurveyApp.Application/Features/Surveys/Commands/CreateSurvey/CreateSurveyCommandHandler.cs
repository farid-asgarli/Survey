using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
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
    IMapper mapper
) : IRequestHandler<CreateSurveyCommand, Result<SurveyDto>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;
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

        // Create survey
        var survey = Survey.Create(ctx.NamespaceId, request.Title, ctx.UserId);

        survey.UpdateDescription(request.Description);

        // Set optional properties
        if (!string.IsNullOrEmpty(request.WelcomeMessage))
        {
            survey.SetWelcomeMessage(request.WelcomeMessage);
        }

        if (!string.IsNullOrEmpty(request.ThankYouMessage))
        {
            survey.SetThankYouMessage(request.ThankYouMessage);
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
                var settings = CreateQuestionSettings(questionDto.Type, questionDto.Settings);
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

    private QuestionSettings? CreateQuestionSettings(QuestionType type, QuestionSettingsDto dto)
    {
        // Serialize the DTO to JSON and then deserialize it using QuestionSettings.FromJson
        // This ensures all properties including RatingStyle and YesNoStyle are preserved
        var json = System.Text.Json.JsonSerializer.Serialize(dto);
        return QuestionSettings.FromJson(json);
    }
}
