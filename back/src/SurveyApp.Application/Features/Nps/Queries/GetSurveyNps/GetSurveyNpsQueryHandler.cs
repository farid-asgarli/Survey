using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Nps.Queries.GetSurveyNps;

/// <summary>
/// Handler for GetSurveyNpsQuery.
/// </summary>
public class GetSurveyNpsQueryHandler(
    INpsService npsService,
    ISurveyRepository surveyRepository,
    INamespaceRepository namespaceRepository,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService
) : IRequestHandler<GetSurveyNpsQuery, Result<SurveyNpsSummaryDto>>
{
    private readonly INpsService _npsService = npsService;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<SurveyNpsSummaryDto>> Handle(
        GetSurveyNpsQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<SurveyNpsSummaryDto>.Failure("Errors.NamespaceRequired");
        }

        // Verify survey exists and belongs to namespace
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null || survey.NamespaceId != namespaceId.Value)
        {
            return Result<SurveyNpsSummaryDto>.NotFound("Errors.SurveyNotFound");
        }

        // Check permission
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<SurveyNpsSummaryDto>.Unauthorized("Errors.UserNotAuthenticated");
        }

        var @namespace = await _namespaceRepository.GetByIdAsync(
            namespaceId.Value,
            cancellationToken
        );
        var membership = @namespace?.Memberships.FirstOrDefault(m => m.UserId == userId.Value);
        if (membership == null || !membership.HasPermission(NamespacePermission.ViewResponses))
        {
            return Result<SurveyNpsSummaryDto>.Forbidden("Errors.NoPermissionViewNps");
        }

        try
        {
            var result = await _npsService.CalculateNpsAsync(request.SurveyId, cancellationToken);
            return Result<SurveyNpsSummaryDto>.Success(result);
        }
        catch (InvalidOperationException ex)
        {
            return Result<SurveyNpsSummaryDto>.Failure(ex.Message);
        }
    }
}
