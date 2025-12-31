using System.Text.Json;
using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Templates.Commands.CreateTemplate;

/// <summary>
/// Handler for creating a new survey template.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class CreateTemplateCommandHandler(
    ISurveyTemplateRepository templateRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext,
    IMapper mapper
) : IRequestHandler<CreateTemplateCommand, Result<SurveyTemplateDto>>
{
    private readonly ISurveyTemplateRepository _templateRepository = templateRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<SurveyTemplateDto>> Handle(
        CreateTemplateCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        // Check if template name already exists
        if (
            await _templateRepository.ExistsByNameAsync(
                ctx.NamespaceId,
                request.Name,
                cancellationToken: cancellationToken
            )
        )
        {
            return Result<SurveyTemplateDto>.Failure("Errors.TemplateNameExists");
        }

        // Create template with localization support
        var template = SurveyTemplate.Create(
            ctx.NamespaceId,
            request.Name,
            ctx.UserId,
            request.LanguageCode,
            request.Description,
            request.Category,
            request.WelcomeMessage,
            request.ThankYouMessage
        );

        template.SetPublic(request.IsPublic);
        template.ConfigureDefaults(
            request.DefaultAllowAnonymous,
            request.DefaultAllowMultipleResponses
        );

        // Add questions with the same language
        foreach (var questionDto in request.Questions.OrderBy(q => q.Order))
        {
            var settingsJson =
                questionDto.Settings != null
                    ? JsonSerializer.Serialize(questionDto.Settings)
                    : null;

            var question = template.AddQuestion(
                questionDto.Text,
                questionDto.Type,
                questionDto.IsRequired,
                questionDto.Description,
                settingsJson,
                request.LanguageCode
            );
        }

        await _templateRepository.AddAsync(template, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<SurveyTemplateDto>(template);
        return Result<SurveyTemplateDto>.Success(dto);
    }
}
