using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Templates.Commands.CreateSurveyFromTemplate;

/// <summary>
/// Handler for creating a survey from a template.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class CreateSurveyFromTemplateCommandHandler(
    ISurveyTemplateRepository templateRepository,
    ISurveyRepository surveyRepository,
    INamespaceRepository namespaceRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext,
    IMapper mapper
) : IRequestHandler<CreateSurveyFromTemplateCommand, Result<SurveyDto>>
{
    private readonly ISurveyTemplateRepository _templateRepository = templateRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<SurveyDto>> Handle(
        CreateSurveyFromTemplateCommand request,
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

        // Get the template with questions
        var template = await _templateRepository.GetByIdWithQuestionsAsync(
            request.TemplateId,
            cancellationToken
        );
        if (template == null || template.NamespaceId != ctx.NamespaceId)
        {
            return Result<SurveyDto>.NotFound("Errors.TemplateNotFound");
        }

        // Create survey from template (with optional language support)
        var survey = template.CreateSurvey(request.SurveyTitle, ctx.UserId, request.LanguageCode);

        if (!string.IsNullOrEmpty(request.Description))
            survey.UpdateDescription(request.Description, request.LanguageCode);

        await _surveyRepository.AddAsync(survey, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<SurveyDto>(survey);
        return Result<SurveyDto>.Success(dto);
    }
}
