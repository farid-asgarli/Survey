using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Application.DTOs.Common;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Application.Features.EmailDistributions.Queries.GetDistributionRecipients;

/// <summary>
/// Query to get recipients for a distribution.
/// </summary>
public record GetDistributionRecipientsQuery
    : PagedQuery,
        IRequest<Result<PagedResponse<EmailRecipientDto>>>
{
    /// <summary>
    /// The survey ID that the distribution belongs to (for IDOR validation).
    /// </summary>
    public Guid SurveyId { get; init; }

    public Guid DistributionId { get; init; }
    public RecipientStatus? Status { get; init; }
}
