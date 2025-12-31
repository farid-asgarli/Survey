using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.EmailDistributions.Queries.GetDistributionRecipients;

public class GetDistributionRecipientsQueryHandler(
    IEmailDistributionRepository distributionRepository,
    INamespaceContext namespaceContext
) : IRequestHandler<GetDistributionRecipientsQuery, Result<IReadOnlyList<EmailRecipientDto>>>
{
    private readonly IEmailDistributionRepository _distributionRepository = distributionRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;

    public async Task<Result<IReadOnlyList<EmailRecipientDto>>> Handle(
        GetDistributionRecipientsQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<IReadOnlyList<EmailRecipientDto>>.Failure("Errors.NamespaceRequired");
        }

        // Verify distribution exists and belongs to namespace
        var distribution = await _distributionRepository.GetByIdAsync(
            request.DistributionId,
            cancellationToken
        );

        if (
            distribution == null
            || distribution.NamespaceId != namespaceId.Value
            || distribution.SurveyId != request.SurveyId
        )
        {
            return Result<IReadOnlyList<EmailRecipientDto>>.NotFound("Errors.DistributionNotFound");
        }

        var (recipients, _) = await _distributionRepository.GetRecipientsPagedAsync(
            request.DistributionId,
            request.PageNumber,
            request.PageSize,
            request.Status,
            cancellationToken
        );

        var dtos = recipients
            .Select(r => new EmailRecipientDto
            {
                Id = r.Id,
                Email = r.Email,
                Name = r.Name,
                Status = r.Status,
                SentAt = r.SentAt,
                DeliveredAt = r.DeliveredAt,
                OpenedAt = r.OpenedAt,
                ClickedAt = r.ClickedAt,
                OpenCount = r.OpenCount,
                ClickCount = r.ClickCount,
                ErrorMessage = r.ErrorMessage,
            })
            .ToList();

        return Result<IReadOnlyList<EmailRecipientDto>>.Success(dtos);
    }
}
