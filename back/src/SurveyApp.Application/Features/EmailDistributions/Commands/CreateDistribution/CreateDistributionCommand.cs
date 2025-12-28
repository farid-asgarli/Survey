using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.EmailDistributions.Commands.CreateDistribution;

/// <summary>
/// Command to create a new email distribution.
/// </summary>
public record CreateDistributionCommand : IRequest<Result<EmailDistributionDto>>
{
    public Guid SurveyId { get; init; }
    public Guid? EmailTemplateId { get; init; }
    public string Subject { get; init; } = null!;
    public string Body { get; init; } = null!;
    public string? SenderName { get; init; }
    public string? SenderEmail { get; init; }
    public List<RecipientInputDto> Recipients { get; init; } = [];
}
