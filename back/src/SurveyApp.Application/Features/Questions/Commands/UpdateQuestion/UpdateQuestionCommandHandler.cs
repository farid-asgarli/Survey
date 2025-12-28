using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Application.Features.Questions.Commands.UpdateQuestion;

/// <summary>
/// Handler for updating a question in a survey.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class UpdateQuestionCommandHandler(
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext,
    IMapper mapper
) : IRequestHandler<UpdateQuestionCommand, Result<QuestionDto>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<QuestionDto>> Handle(
        UpdateQuestionCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        var survey = await _surveyRepository.GetByIdWithQuestionsAsync(
            request.SurveyId,
            cancellationToken
        );
        if (survey == null || survey.NamespaceId != ctx.NamespaceId)
        {
            return Result<QuestionDto>.Failure("Survey not found.");
        }

        // Check if survey can be edited
        if (survey.Status != SurveyStatus.Draft)
        {
            return Result<QuestionDto>.Failure("Only draft surveys can be edited.");
        }

        var question = survey.Questions.FirstOrDefault(q => q.Id == request.QuestionId);
        if (question == null)
        {
            return Result<QuestionDto>.Failure("Question not found.");
        }

        // Update question properties
        question.UpdateText(request.Text);
        question.UpdateRequired(request.IsRequired);
        question.UpdateDescription(request.Description);

        // Update type if changed
        if (question.Type != request.Type)
        {
            question.UpdateType(request.Type);
        }

        // Update order if specified
        if (request.Order.HasValue)
        {
            question.UpdateOrder(request.Order.Value);
        }

        // Update settings if provided
        if (request.Settings != null)
        {
            var settings = CreateQuestionSettings(request.Type, request.Settings);
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
        else if (question.IsNpsQuestion)
        {
            question.RemoveNpsDesignation();
        }

        _surveyRepository.Update(survey);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<QuestionDto>(question);
        return Result<QuestionDto>.Success(dto);
    }

    private QuestionSettings? CreateQuestionSettings(QuestionType type, QuestionSettingsDto dto)
    {
        // Serialize the DTO to JSON and then deserialize it using QuestionSettings.FromJson
        // This ensures all properties including RatingStyle and YesNoStyle are preserved
        var json = System.Text.Json.JsonSerializer.Serialize(dto);
        return QuestionSettings.FromJson(json);
    }
}
