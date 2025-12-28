using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Features.EmailDistributions.Queries.GetDistributionRecipients;

/// <summary>
/// Query to get recipients for a distribution.
/// </summary>
public record GetDistributionRecipientsQuery : IRequest<Result<IReadOnlyList<EmailRecipientDto>>>
{
    public Guid DistributionId { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 50;
    public RecipientStatus? Status { get; init; }
}
