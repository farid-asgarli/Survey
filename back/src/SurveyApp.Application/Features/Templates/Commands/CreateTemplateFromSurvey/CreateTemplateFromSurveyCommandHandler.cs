using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Templates.Commands.CreateTemplateFromSurvey;

/// <summary>
/// Handler for creating a template from an existing survey.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class CreateTemplateFromSurveyCommandHandler(
    ISurveyTemplateRepository templateRepository,
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext,
    IMapper mapper
) : IRequestHandler<CreateTemplateFromSurveyCommand, Result<SurveyTemplateDto>>
{
    private readonly ISurveyTemplateRepository _templateRepository = templateRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<SurveyTemplateDto>> Handle(
        CreateTemplateFromSurveyCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        // Get the survey with questions
        var survey = await _surveyRepository.GetByIdWithQuestionsAsync(
            request.SurveyId,
            cancellationToken
        );
        if (survey == null || survey.NamespaceId != ctx.NamespaceId)
        {
            return Result<SurveyTemplateDto>.Failure("Survey not found.");
        }

        // Check if template name already exists
        if (
            await _templateRepository.ExistsByNameAsync(
                ctx.NamespaceId,
                request.TemplateName,
                cancellationToken: cancellationToken
            )
        )
        {
            return Result<SurveyTemplateDto>.Failure("A template with this name already exists.");
        }

        // Create template from survey
        var template = SurveyTemplate.CreateFromSurvey(survey, request.TemplateName, ctx.UserId);

        if (!string.IsNullOrEmpty(request.Description))
            template.UpdateDescription(request.Description);

        if (!string.IsNullOrEmpty(request.Category))
            template.UpdateCategory(request.Category);

        template.SetPublic(request.IsPublic);

        await _templateRepository.AddAsync(template, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<SurveyTemplateDto>(template);
        return Result<SurveyTemplateDto>.Success(dto);
    }
}
