using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Domain.Specifications;
using SurveyApp.Domain.Specifications.Surveys;

namespace SurveyApp.Application.Features.Surveys.Queries.GetSurveyById;

public class GetSurveyByIdQueryHandler(
    ISpecificationRepository<Survey> surveySpecRepository,
    INamespaceRepository namespaceRepository,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService,
    IMapper mapper
) : IRequestHandler<GetSurveyByIdQuery, Result<SurveyDetailsDto>>
{
    private readonly ISpecificationRepository<Survey> _surveySpecRepository = surveySpecRepository;
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<SurveyDetailsDto>> Handle(
        GetSurveyByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<SurveyDetailsDto>.Failure("Errors.NamespaceContextRequired");
        }

        var spec = new SurveyWithQuestionsSpec(request.SurveyId);
        var survey = await _surveySpecRepository.FirstOrDefaultAsync(spec, cancellationToken);

        if (survey == null || survey.NamespaceId != namespaceId.Value)
        {
            return Result<SurveyDetailsDto>.NotFound("Errors.SurveyNotFound");
        }

        // Check permission
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<SurveyDetailsDto>.Unauthorized("Errors.UserNotAuthenticated");
        }

        var @namespace = await _namespaceRepository.GetByIdAsync(
            namespaceId.Value,
            cancellationToken
        );
        var membership = @namespace?.Memberships.FirstOrDefault(m => m.UserId == userId.Value);
        if (membership == null || !membership.HasPermission(NamespacePermission.ViewSurveys))
        {
            return Result<SurveyDetailsDto>.Failure(
                "You do not have permission to view this survey."
            );
        }

        var dto = _mapper.Map<SurveyDetailsDto>(survey);
        return Result<SurveyDetailsDto>.Success(dto);
    }
}
