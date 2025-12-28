using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.EmailDistributions.Queries.GetDistributions;

public class GetDistributionsQueryHandler(
    IEmailDistributionRepository distributionRepository,
    ISurveyRepository surveyRepository,
    INamespaceContext namespaceContext
) : IRequestHandler<GetDistributionsQuery, Result<IReadOnlyList<EmailDistributionSummaryDto>>>
{
    private readonly IEmailDistributionRepository _distributionRepository = distributionRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;

    public async Task<Result<IReadOnlyList<EmailDistributionSummaryDto>>> Handle(
        GetDistributionsQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<IReadOnlyList<EmailDistributionSummaryDto>>.Failure(
                "Errors.NamespaceRequired"
            );
        }

        // Verify survey exists and belongs to namespace
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null || survey.NamespaceId != namespaceId.Value)
        {
            return Result<IReadOnlyList<EmailDistributionSummaryDto>>.Failure(
                "Errors.SurveyNotFound"
            );
        }

        var (distributions, _) = await _distributionRepository.GetPagedBySurveyIdAsync(
            request.SurveyId,
            request.PageNumber,
            request.PageSize,
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

        return Result<IReadOnlyList<EmailDistributionSummaryDto>>.Success(dtos);
    }
}
