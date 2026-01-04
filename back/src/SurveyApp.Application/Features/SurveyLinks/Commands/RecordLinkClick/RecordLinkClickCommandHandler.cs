using System.Text.Json;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.SurveyLinks.Commands.RecordLinkClick;

/// <summary>
/// Handler for recording a link click.
/// </summary>
public class RecordLinkClickCommandHandler(
    ISurveyLinkRepository surveyLinkRepository,
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    IGeoLocationService geoLocationService
) : IRequestHandler<RecordLinkClickCommand, Result<RecordLinkClickResult>>
{
    private readonly ISurveyLinkRepository _surveyLinkRepository = surveyLinkRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IGeoLocationService _geoLocationService = geoLocationService;

    public async Task<Result<RecordLinkClickResult>> Handle(
        RecordLinkClickCommand request,
        CancellationToken cancellationToken
    )
    {
        // Get the link by token
        var link = await _surveyLinkRepository.GetByTokenAsync(request.Token, cancellationToken);
        if (link == null)
        {
            return Result<RecordLinkClickResult>.Failure("Errors.InvalidSurveyLink");
        }

        // Check if link is valid
        if (!link.IsValid())
        {
            if (!link.IsActive)
                return Result<RecordLinkClickResult>.Failure(
                    "Application.SurveyLink.LinkDeactivated"
                );

            if (link.ExpiresAt.HasValue && DateTime.UtcNow > link.ExpiresAt.Value)
                return Result<RecordLinkClickResult>.Failure("Errors.SurveyLinkExpired");

            if (link.MaxUses.HasValue && link.UsageCount >= link.MaxUses.Value)
                return Result<RecordLinkClickResult>.Failure(
                    "Application.SurveyLink.MaxUsageReached"
                );
        }

        // Validate password if required
        if (!link.ValidatePassword(request.Password))
        {
            return Result<RecordLinkClickResult>.Failure("Errors.InvalidSurveyLinkPassword");
        }

        // Get the survey
        var survey = await _surveyRepository.GetByIdAsync(link.SurveyId, cancellationToken);
        if (survey == null)
        {
            return Result<RecordLinkClickResult>.NotFound("Errors.SurveyNotFound");
        }

        if (!survey.CanAcceptResponses)
        {
            return Result<RecordLinkClickResult>.Failure(
                "Application.Survey.NotAcceptingResponses"
            );
        }

        // Record the click
        var click = LinkClick.Create(
            link.Id,
            request.IpAddress,
            request.UserAgent,
            request.Referrer
        );

        // Parse user agent for device info (simplified)
        SetDeviceInfoFromUserAgent(click, request.UserAgent);

        // Get geolocation data (non-blocking - failures are ignored)
        if (!string.IsNullOrEmpty(request.IpAddress))
        {
            var geoLocation = await _geoLocationService.GetLocationAsync(
                request.IpAddress,
                cancellationToken
            );
            if (geoLocation != null)
            {
                click.SetGeolocation(geoLocation.Country, geoLocation.City);
            }
        }

        // Record usage for non-unique links only
        // For unique links, usage is recorded only when the response is completed
        // This prevents marking the link as "used" when someone just opens the survey without completing it
        if (link.Type != Domain.Enums.SurveyLinkType.Unique)
        {
            link.RecordUsage();
        }

        await _surveyLinkRepository.AddClickAsync(click, cancellationToken);
        _surveyLinkRepository.Update(link);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Parse prefill data if present
        Dictionary<string, string>? prefillData = null;
        if (!string.IsNullOrEmpty(link.PrefillDataJson))
        {
            try
            {
                prefillData = JsonSerializer.Deserialize<Dictionary<string, string>>(
                    link.PrefillDataJson
                );
            }
            catch
            {
                // Ignore deserialization errors
            }
        }

        return Result<RecordLinkClickResult>.Success(
            new RecordLinkClickResult
            {
                SurveyId = survey.Id,
                SurveyAccessToken = survey.AccessToken,
                ClickId = click.Id,
                PrefillData = prefillData,
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
            userAgent.Contains("Tablet", StringComparison.OrdinalIgnoreCase)
            || userAgent.Contains("iPad", StringComparison.OrdinalIgnoreCase)
        )
        {
            deviceType = "Tablet";
        }

        // Simple browser detection
        string browser = "Unknown";
        if (
            userAgent.Contains("Chrome", StringComparison.OrdinalIgnoreCase)
            && !userAgent.Contains("Edg", StringComparison.OrdinalIgnoreCase)
        )
        {
            browser = "Chrome";
        }
        else if (userAgent.Contains("Firefox", StringComparison.OrdinalIgnoreCase))
        {
            browser = "Firefox";
        }
        else if (
            userAgent.Contains("Safari", StringComparison.OrdinalIgnoreCase)
            && !userAgent.Contains("Chrome", StringComparison.OrdinalIgnoreCase)
        )
        {
            browser = "Safari";
        }
        else if (userAgent.Contains("Edg", StringComparison.OrdinalIgnoreCase))
        {
            browser = "Edge";
        }

        // Simple OS detection
        string os = "Unknown";
        if (userAgent.Contains("Windows", StringComparison.OrdinalIgnoreCase))
        {
            os = "Windows";
        }
        else if (userAgent.Contains("Mac OS", StringComparison.OrdinalIgnoreCase))
        {
            os = "macOS";
        }
        else if (userAgent.Contains("Linux", StringComparison.OrdinalIgnoreCase))
        {
            os = "Linux";
        }
        else if (userAgent.Contains("Android", StringComparison.OrdinalIgnoreCase))
        {
            os = "Android";
        }
        else if (
            userAgent.Contains("iOS", StringComparison.OrdinalIgnoreCase)
            || userAgent.Contains("iPhone", StringComparison.OrdinalIgnoreCase)
            || userAgent.Contains("iPad", StringComparison.OrdinalIgnoreCase)
        )
        {
            os = "iOS";
        }

        click.SetDeviceInfo(deviceType, browser, os);
    }
}
