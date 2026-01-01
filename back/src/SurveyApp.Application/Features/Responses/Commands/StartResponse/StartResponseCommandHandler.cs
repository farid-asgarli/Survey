using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Responses.Commands.StartResponse;

/// <summary>
/// Handler for starting a new survey response.
/// Creates a draft response and optionally tracks link usage.
/// </summary>
public class StartResponseCommandHandler(
    ISurveyRepository surveyRepository,
    ISurveyLinkRepository surveyLinkRepository,
    ISurveyResponseRepository responseRepository,
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService
) : IRequestHandler<StartResponseCommand, Result<StartResponseResult>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly ISurveyLinkRepository _surveyLinkRepository = surveyLinkRepository;
    private readonly ISurveyResponseRepository _responseRepository = responseRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<StartResponseResult>> Handle(
        StartResponseCommand request,
        CancellationToken cancellationToken
    )
    {
        // Get the survey
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null)
            return Result<StartResponseResult>.Failure("Handler.SurveyNotFound");

        // Check if survey is accepting responses
        if (!survey.IsAcceptingResponses)
            return Result<StartResponseResult>.Failure("Application.Survey.NotAcceptingResponses");

        // Check max responses limit
        if (survey.MaxResponses.HasValue)
        {
            var responseCount = await _responseRepository.GetResponseCountAsync(
                survey.Id,
                cancellationToken
            );
            if (responseCount >= survey.MaxResponses.Value)
                return Result<StartResponseResult>.Failure(
                    "Application.Survey.MaxResponsesReached"
                );
        }

        // Handle survey link if provided
        SurveyLink? surveyLink = null;
        if (!string.IsNullOrEmpty(request.LinkToken))
        {
            // Use GetByTokenForUpdateAsync to enable change tracking
            surveyLink = await _surveyLinkRepository.GetByTokenForUpdateAsync(
                request.LinkToken,
                cancellationToken
            );

            if (surveyLink == null)
                return Result<StartResponseResult>.Failure("Errors.InvalidSurveyLink");

            // Validate the link
            if (!surveyLink.IsActive)
                return Result<StartResponseResult>.Failure(
                    "Application.SurveyLink.LinkDeactivated"
                );

            if (surveyLink.ExpiresAt.HasValue && DateTime.UtcNow > surveyLink.ExpiresAt.Value)
                return Result<StartResponseResult>.Failure("Errors.SurveyLinkExpired");

            if (surveyLink.MaxUses.HasValue && surveyLink.UsageCount >= surveyLink.MaxUses.Value)
                return Result<StartResponseResult>.Failure(
                    "Application.SurveyLink.MaxUsageReached"
                );

            // Verify link belongs to this survey
            if (surveyLink.SurveyId != survey.Id)
                return Result<StartResponseResult>.Failure("Application.SurveyLink.SurveyMismatch");

            // Record the link usage (click/start)
            // Note: surveyLink is already tracked, changes will be saved automatically
            surveyLink.RecordUsage();
        }

        // Determine respondent email
        string? respondentEmail = request.RespondentEmail;
        if (
            !survey.IsAnonymous
            && _currentUserService.UserId.HasValue
            && string.IsNullOrEmpty(respondentEmail)
        )
            respondentEmail = _currentUserService.Email;

        // Create the draft response
        var response = SurveyResponse.Create(
            survey.Id,
            survey.AccessToken,
            surveyLink?.Id,
            respondentEmail
        );

        // Set respondent info if provided
        if (!string.IsNullOrEmpty(request.RespondentName))
            response.SetRespondentInfo(respondentEmail, request.RespondentName);

        await _responseRepository.AddAsync(response, cancellationToken);

        // Create LinkClick record if a link was used (for analytics)
        if (surveyLink != null)
        {
            var click = LinkClick.Create(
                surveyLink.Id,
                request.IpAddress,
                request.UserAgent,
                request.Referrer
            );

            // Associate the click with the response immediately
            click.AssociateResponse(response.Id);

            // Parse user agent for device info
            SetDeviceInfoFromUserAgent(click, request.UserAgent);

            await _surveyLinkRepository.AddClickAsync(click, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<StartResponseResult>.Success(
            new StartResponseResult
            {
                ResponseId = response.Id,
                SurveyId = survey.Id,
                StartedAt = response.StartedAt,
            }
        );
    }

    private static void SetDeviceInfoFromUserAgent(LinkClick click, string? userAgent)
    {
        if (string.IsNullOrEmpty(userAgent))
            return;

        // Simple device detection
        string deviceType = "Desktop";
        if (
            userAgent.Contains("Mobile", StringComparison.OrdinalIgnoreCase)
            || userAgent.Contains("Android", StringComparison.OrdinalIgnoreCase)
            || userAgent.Contains("iPhone", StringComparison.OrdinalIgnoreCase)
        )
        {
            deviceType = "Mobile";
        }
        else if (
            userAgent.Contains("iPad", StringComparison.OrdinalIgnoreCase)
            || userAgent.Contains("Tablet", StringComparison.OrdinalIgnoreCase)
        )
        {
            deviceType = "Tablet";
        }

        // Simple browser detection
        string? browser = null;
        if (userAgent.Contains("Chrome", StringComparison.OrdinalIgnoreCase))
            browser = "Chrome";
        else if (userAgent.Contains("Firefox", StringComparison.OrdinalIgnoreCase))
            browser = "Firefox";
        else if (userAgent.Contains("Safari", StringComparison.OrdinalIgnoreCase))
            browser = "Safari";
        else if (userAgent.Contains("Edge", StringComparison.OrdinalIgnoreCase))
            browser = "Edge";

        // Simple OS detection
        string? os = null;
        if (userAgent.Contains("Windows", StringComparison.OrdinalIgnoreCase))
            os = "Windows";
        else if (userAgent.Contains("Mac", StringComparison.OrdinalIgnoreCase))
            os = "macOS";
        else if (userAgent.Contains("Linux", StringComparison.OrdinalIgnoreCase))
            os = "Linux";
        else if (userAgent.Contains("Android", StringComparison.OrdinalIgnoreCase))
            os = "Android";
        else if (userAgent.Contains("iOS", StringComparison.OrdinalIgnoreCase))
            os = "iOS";

        click.SetDeviceInfo(deviceType, browser, os);
    }
}
