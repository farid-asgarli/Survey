using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Templates.Queries.GetTemplateById;

public class GetTemplateByIdQueryHandler(
    ISurveyTemplateRepository templateRepository,
    INamespaceContext namespaceContext,
    IMapper mapper
) : IRequestHandler<GetTemplateByIdQuery, Result<SurveyTemplateDto>>
{
    private readonly ISurveyTemplateRepository _templateRepository = templateRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<SurveyTemplateDto>> Handle(
        GetTemplateByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<SurveyTemplateDto>.Failure("Namespace context is required.");
        }

        var template = await _templateRepository.GetByIdWithQuestionsAsync(
            request.TemplateId,
            cancellationToken
        );

        if (template == null || template.NamespaceId != namespaceId.Value)
        {
            return Result<SurveyTemplateDto>.Failure("Template not found.");
        }

        var dto = _mapper.Map<SurveyTemplateDto>(template);
        return Result<SurveyTemplateDto>.Success(dto);
    }
}
