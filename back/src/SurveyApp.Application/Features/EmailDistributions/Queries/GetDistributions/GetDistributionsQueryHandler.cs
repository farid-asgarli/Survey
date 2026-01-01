using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Domain.Specifications;
using SurveyApp.Domain.Specifications.Distributions;

namespace SurveyApp.Application.Features.EmailDistributions.Queries.GetDistributions;

public class GetDistributionsQueryHandler(
    ISpecificationRepository<EmailDistribution> distributionRepository,
    ISurveyRepository surveyRepository,
    INamespaceContext namespaceContext
) : IRequestHandler<GetDistributionsQuery, Result<PagedResponse<EmailDistributionSummaryDto>>>
{
    private readonly ISpecificationRepository<EmailDistribution> _distributionRepository =
        distributionRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;

    public async Task<Result<PagedResponse<EmailDistributionSummaryDto>>> Handle(
        GetDistributionsQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<PagedResponse<EmailDistributionSummaryDto>>.Failure(
                "Errors.NamespaceRequired"
            );
        }

        // Verify survey exists and belongs to namespace
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null || survey.NamespaceId != namespaceId.Value)
        {
            return Result<PagedResponse<EmailDistributionSummaryDto>>.Failure(
                "Errors.SurveyNotFound"
            );
        }

        // Use specification pattern for querying
        var spec = new DistributionsBySurveySpec(
            request.SurveyId,
            PagingParameters.Create(request.PageNumber, request.PageSize)
        );

        var (distributions, totalCount) = await _distributionRepository.GetPagedAsync(
            spec,
            cancellationToken
        );

        var dtos = distributions
            .Select(d => new EmailDistributionSummaryDto
            {
                Id = d.Id,
                SurveyId = d.SurveyId,
                SurveyTitle = survey.Title,
                Subject = d.Subject,
                ScheduledAt = d.ScheduledAt,
                SentAt = d.SentAt,
                Status = d.Status,
                TotalRecipients = d.TotalRecipients,
                SentCount = d.SentCount,
                OpenedCount = d.OpenedCount,
                CreatedAt = d.CreatedAt,
            })
            .ToList();

        var pagedResponse = PagedResponse<EmailDistributionSummaryDto>.Create(
            dtos,
            request.PageNumber,
            request.PageSize,
            totalCount
        );

        return Result<PagedResponse<EmailDistributionSummaryDto>>.Success(pagedResponse);
    }
}
