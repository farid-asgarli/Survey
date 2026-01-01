using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.EmailDistributions.Commands.CreateDistribution;

public class CreateDistributionCommandHandler(
    IEmailDistributionRepository distributionRepository,
    ISurveyRepository surveyRepository,
    IEmailTemplateRepository templateRepository,
    IUnitOfWork unitOfWork,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService
) : IRequestHandler<CreateDistributionCommand, Result<EmailDistributionDto>>
{
    private readonly IEmailDistributionRepository _distributionRepository = distributionRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IEmailTemplateRepository _templateRepository = templateRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<EmailDistributionDto>> Handle(
        CreateDistributionCommand request,
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

        // Verify survey exists and belongs to namespace
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null || survey.NamespaceId != namespaceId.Value)
        {
            return Result<EmailDistributionDto>.NotFound("Errors.SurveyNotFound");
        }

        // Verify template if provided
        EmailTemplate? template = null;
        if (request.EmailTemplateId.HasValue)
        {
            template = await _templateRepository.GetByIdAsync(
                request.EmailTemplateId.Value,
                cancellationToken
            );

            if (template == null || template.NamespaceId != namespaceId.Value)
            {
                return Result<EmailDistributionDto>.NotFound("Errors.EmailTemplateNotFound");
            }
        }

        // Create distribution
        var distribution = EmailDistribution.Create(
            request.SurveyId,
            namespaceId.Value,
            request.Subject,
            request.Body
        );

        distribution.SetTemplate(request.EmailTemplateId);
        distribution.UpdateSender(request.SenderName, request.SenderEmail);

        // Add recipients
        foreach (var recipient in request.Recipients)
        {
            distribution.AddRecipient(recipient.Email, recipient.Name);
        }

        _distributionRepository.Add(distribution);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<EmailDistributionDto>.Success(
            MapToDto(distribution, survey.Title, template?.Name)
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
                TotalRecipients = distribution.TotalRecipients,
                SentCount = distribution.SentCount,
                DeliveredCount = distribution.DeliveredCount,
                OpenedCount = distribution.OpenedCount,
                ClickedCount = distribution.ClickedCount,
                BouncedCount = distribution.BouncedCount,
                UnsubscribedCount = distribution.UnsubscribedCount,
            },
            CreatedAt = distribution.CreatedAt,
            UpdatedAt = distribution.UpdatedAt,
        };
    }
}
