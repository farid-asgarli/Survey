using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Responses.Queries.GetResponseById;

public class GetResponseByIdQueryHandler(
    ISurveyResponseRepository responseRepository,
    ISurveyRepository surveyRepository,
    INamespaceRepository namespaceRepository,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService,
    IMapper mapper
) : IRequestHandler<GetResponseByIdQuery, Result<SurveyResponseDto>>
{
    private readonly ISurveyResponseRepository _responseRepository = responseRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<SurveyResponseDto>> Handle(
        GetResponseByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<SurveyResponseDto>.Failure("Namespace context is required.");
        }

        var response = await _responseRepository.GetByIdWithAnswersAsync(
            request.ResponseId,
            cancellationToken
        );
        if (response == null)
        {
            return Result<SurveyResponseDto>.Failure("Response not found.");
        }

        // Verify response belongs to a survey in the namespace
        var survey = await _surveyRepository.GetByIdAsync(response.SurveyId, cancellationToken);
        if (survey == null || survey.NamespaceId != namespaceId.Value)
        {
            return Result<SurveyResponseDto>.Failure("Response not found.");
        }

        // Check permission
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<SurveyResponseDto>.Failure("User not authenticated.");
        }

        var @namespace = await _namespaceRepository.GetByIdAsync(
            namespaceId.Value,
            cancellationToken
        );
        var membership = @namespace?.Memberships.FirstOrDefault(m => m.UserId == userId.Value);
        if (membership == null || !membership.HasPermission(NamespacePermission.ViewResponses))
        {
            return Result<SurveyResponseDto>.Failure(
                "You do not have permission to view this response."
            );
        }

        var dto = _mapper.Map<SurveyResponseDto>(response);
        return Result<SurveyResponseDto>.Success(dto);
    }
}
