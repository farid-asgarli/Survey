using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.EmailDistributions.Commands.SendDistribution;

public class SendDistributionCommandHandler(
    IEmailDistributionRepository distributionRepository,
    ISurveyRepository surveyRepository,
    IEmailTemplateRepository templateRepository,
    IEmailDistributionService emailDistributionService,
    IUnitOfWork unitOfWork,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService
) : IRequestHandler<SendDistributionCommand, Result<EmailDistributionDto>>
{
    private readonly IEmailDistributionRepository _distributionRepository = distributionRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IEmailTemplateRepository _templateRepository = templateRepository;
    private readonly IEmailDistributionService _emailDistributionService = emailDistributionService;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<EmailDistributionDto>> Handle(
        SendDistributionCommand request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<EmailDistributionDto>.Failure("Errors.NamespaceRequired");
        }

        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<EmailDistributionDto>.Unauthorized("Errors.UserNotAuthenticated");
        }

        // Get distribution with recipients
        var distribution = await _distributionRepository.GetByIdWithRecipientsAsync(
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

        try
        {
            distribution.StartSending();
        }
        catch (InvalidOperationException ex)
        {
            return Result<EmailDistributionDto>.Failure(ex.Message);
        }

        _distributionRepository.Update(distribution);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Send emails asynchronously
        await _emailDistributionService.SendDistributionAsync(distribution.Id, cancellationToken);

        // Refresh distribution data
        distribution = await _distributionRepository.GetByIdWithRecipientsAsync(
            request.DistributionId,
            cancellationToken
        );

        // Get related data for DTO
        var survey = await _surveyRepository.GetByIdAsync(
            distribution!.SurveyId,
            cancellationToken
        );
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
        Domain.Entities.EmailDistribution distribution,
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
