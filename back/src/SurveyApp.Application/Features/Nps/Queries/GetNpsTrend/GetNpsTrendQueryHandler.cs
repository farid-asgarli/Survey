using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.Services;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Nps.Queries.GetNpsTrend;

/// <summary>
/// Handler for GetNpsTrendQuery.
/// </summary>
public class GetNpsTrendQueryHandler(
    INpsService npsService,
    ISurveyRepository surveyRepository,
    INamespaceRepository namespaceRepository,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService
) : IRequestHandler<GetNpsTrendQuery, Result<NpsTrendDto>>
{
    private readonly INpsService _npsService = npsService;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<NpsTrendDto>> Handle(
        GetNpsTrendQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<NpsTrendDto>.Failure("Errors.NamespaceRequired");
        }

        // Verify survey exists and belongs to namespace
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null || survey.NamespaceId != namespaceId.Value)
        {
            return Result<NpsTrendDto>.Failure("Errors.SurveyNotFound");
        }

        // Check permission
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<NpsTrendDto>.Failure("Errors.UserNotAuthenticated");
        }

        var @namespace = await _namespaceRepository.GetByIdAsync(
            namespaceId.Value,
            cancellationToken
        );
        var membership = @namespace?.Memberships.FirstOrDefault(m => m.UserId == userId.Value);
        if (membership == null || !membership.HasPermission(NamespacePermission.ViewResponses))
        {
            return Result<NpsTrendDto>.Failure("Errors.NoPermissionViewNps");
        }

        // Validate date range
        if (request.FromDate >= request.ToDate)
        {
            return Result<NpsTrendDto>.Failure("Validation.FromDateBeforeToDate");
        }

        try
        {
            var result = await _npsService.GetNpsTrendAsync(
                request.SurveyId,
                request.FromDate,
                request.ToDate,
                request.GroupBy,
                cancellationToken
            );
            return Result<NpsTrendDto>.Success(result);
        }
        catch (InvalidOperationException ex)
        {
            return Result<NpsTrendDto>.Failure(ex.Message);
        }
    }
}
