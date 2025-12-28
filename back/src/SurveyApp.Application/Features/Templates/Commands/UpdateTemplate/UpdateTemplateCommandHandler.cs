using System.Text.Json;
using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Application.Features.Templates.Commands.UpdateTemplate;

/// <summary>
/// Handler for updating a template.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class UpdateTemplateCommandHandler(
    ISurveyTemplateRepository templateRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext,
    IMapper mapper
) : IRequestHandler<UpdateTemplateCommand, Result<SurveyTemplateDto>>
{
    private readonly ISurveyTemplateRepository _templateRepository = templateRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<SurveyTemplateDto>> Handle(
        UpdateTemplateCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        // Get the template with questions
        var template = await _templateRepository.GetByIdWithQuestionsAsync(
            request.TemplateId,
            cancellationToken
        );
        if (template == null || template.NamespaceId != ctx.NamespaceId)
        {
            return Result<SurveyTemplateDto>.Failure("Template not found.");
        }

        // Check if new name conflicts with existing template
        if (
            template.Name != request.Name
            && await _templateRepository.ExistsByNameAsync(
                ctx.NamespaceId,
                request.Name,
                template.Id,
                cancellationToken
            )
        )
        {
            return Result<SurveyTemplateDto>.Failure("A template with this name already exists.");
        }

        // Update template properties
        template.UpdateName(request.Name);
        template.UpdateDescription(request.Description);
        template.UpdateCategory(request.Category);
        template.SetPublic(request.IsPublic);
        template.SetWelcomeMessage(request.WelcomeMessage);
        template.SetThankYouMessage(request.ThankYouMessage);
        template.ConfigureDefaults(
            request.DefaultAllowAnonymous,
            request.DefaultAllowMultipleResponses
        );

        // Handle questions update
        var existingQuestionIds = template.Questions.Select(q => q.Id).ToHashSet();
        var updatedQuestionIds = request
            .Questions.Where(q => q.Id.HasValue)
            .Select(q => q.Id!.Value)
            .ToHashSet();

        // Remove questions that are no longer in the request
        var questionsToRemove = existingQuestionIds.Except(updatedQuestionIds).ToList();
        foreach (var questionId in questionsToRemove)
        {
            template.RemoveQuestion(questionId);
        }

        // Update existing questions and add new ones
        foreach (var questionDto in request.Questions.OrderBy(q => q.Order))
        {
            if (questionDto.Id.HasValue && existingQuestionIds.Contains(questionDto.Id.Value))
            {
                // Update existing question
                var existingQuestion = template.Questions.First(q => q.Id == questionDto.Id.Value);
                existingQuestion.UpdateText(questionDto.Text);
                existingQuestion.UpdateType(questionDto.Type);
                existingQuestion.UpdateRequired(questionDto.IsRequired);
                existingQuestion.UpdateDescription(questionDto.Description);
                existingQuestion.UpdateOrder(questionDto.Order);

                if (questionDto.Settings != null)
                {
                    var settings = QuestionSettings.FromJson(
                        JsonSerializer.Serialize(questionDto.Settings)
                    );
                    existingQuestion.UpdateSettings(settings);
                }
            }
            else
            {
                // Add new question
                var settingsJson =
                    questionDto.Settings != null
                        ? JsonSerializer.Serialize(questionDto.Settings)
                        : null;

                template.AddQuestion(
                    questionDto.Text,
                    questionDto.Type,
                    questionDto.IsRequired,
                    questionDto.Description,
                    settingsJson
                );
            }
        }

        _templateRepository.Update(template);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<SurveyTemplateDto>(template);
        return Result<SurveyTemplateDto>.Success(dto);
    }
}
