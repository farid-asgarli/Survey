using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Surveys.Queries.GetSurveyById;

public class GetSurveyByIdQueryHandler(
    ISurveyRepository surveyRepository,
    INamespaceRepository namespaceRepository,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService,
    IMapper mapper
) : IRequestHandler<GetSurveyByIdQuery, Result<SurveyDetailsDto>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
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
            return Result<SurveyDetailsDto>.Failure("Namespace context is required.");
        }

        var survey = await _surveyRepository.GetByIdWithQuestionsAsync(
            request.SurveyId,
            cancellationToken
        );
        if (survey == null || survey.NamespaceId != namespaceId.Value)
        {
            return Result<SurveyDetailsDto>.Failure("Survey not found.");
        }

        // Check permission
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<SurveyDetailsDto>.Failure("User not authenticated.");
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
