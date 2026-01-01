using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.EmailDistributions.Queries.GetDistributionById;

public class GetDistributionByIdQueryHandler(
    IEmailDistributionRepository distributionRepository,
    ISurveyRepository surveyRepository,
    IEmailTemplateRepository templateRepository,
    INamespaceContext namespaceContext
) : IRequestHandler<GetDistributionByIdQuery, Result<EmailDistributionDto>>
{
    private readonly IEmailDistributionRepository _distributionRepository = distributionRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IEmailTemplateRepository _templateRepository = templateRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;

    public async Task<Result<EmailDistributionDto>> Handle(
        GetDistributionByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<EmailDistributionDto>.Failure("Errors.NamespaceRequired");
        }

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
            return Result<EmailDistributionDto>.NotFound("Errors.DistributionNotFound");
        }

        // Get related data
        var survey = await _surveyRepository.GetByIdAsync(distribution.SurveyId, cancellationToken);
        string? templateName = null;
        if (distribution.EmailTemplateId.HasValue)
        {
            var template = await _templateRepository.GetByIdAsync(
                distribution.EmailTemplateId.Value,
                cancellationToken
            );
            templateName = template?.Name;
        }

        return Result<EmailDistributionDto>.Success(
            MapToDto(distribution, survey?.Title ?? "", templateName)
        );
    }

    private static EmailDistributionDto MapToDto(
        EmailDistribution distribution,
        string surveyTitle,
        string? templateName
    )
    {
        return new EmailDistributionDto
        {
            Id = distribution.Id,
            SurveyId = distribution.SurveyId,
            SurveyTitle = surveyTitle,
            EmailTemplateId = distribution.EmailTemplateId,
            EmailTemplateName = templateName,
            Subject = distribution.Subject,
            Body = distribution.Body,
            SenderName = distribution.SenderName,
            SenderEmail = distribution.SenderEmail,
            ScheduledAt = distribution.ScheduledAt,
            SentAt = distribution.SentAt,
            Status = distribution.Status,
            Stats = new DistributionStatsDto
            {
                DistributionId = distribution.Id,
                TotalRecipients = distribution.TotalRecipients,
                Sent = distribution.SentCount,
                Delivered = distribution.DeliveredCount,
                Opened = distribution.OpenedCount,
                Clicked = distribution.ClickedCount,
                Bounced = distribution.BouncedCount,
                Failed =
                    distribution.Recipients?.Count(r =>
                        r.Status == Domain.Enums.RecipientStatus.Failed
                    ) ?? 0,
            },
            CreatedAt = distribution.CreatedAt,
            UpdatedAt = distribution.UpdatedAt,
        };
    }
}
