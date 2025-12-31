using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.SurveyLinks.Queries.GetLinkAnalytics;

/// <summary>
/// Handler for getting analytics for a survey link.
/// </summary>
public class GetLinkAnalyticsQueryHandler(
    ISurveyLinkRepository surveyLinkRepository,
    ISurveyRepository surveyRepository,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService
) : IRequestHandler<GetLinkAnalyticsQuery, Result<LinkAnalyticsDto>>
{
    private readonly ISurveyLinkRepository _surveyLinkRepository = surveyLinkRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<LinkAnalyticsDto>> Handle(
        GetLinkAnalyticsQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<LinkAnalyticsDto>.Failure("Handler.NamespaceContextRequired");
        }

        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<LinkAnalyticsDto>.Failure("Errors.UserNotAuthenticated");
        }

        // Get the survey and verify it belongs to the namespace
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null)
        {
            return Result<LinkAnalyticsDto>.Failure("Handler.SurveyNotFound");
        }

        if (survey.NamespaceId != namespaceId.Value)
        {
            return Result<LinkAnalyticsDto>.Failure("Errors.SurveyNotInNamespace");
        }

        // Get the link with clicks
        var link = await _surveyLinkRepository.GetByIdWithClicksAsync(
            request.LinkId,
            cancellationToken
        );
        if (link == null)
        {
            return Result<LinkAnalyticsDto>.Failure("Errors.SurveyLinkNotFound");
        }

        if (link.SurveyId != request.SurveyId)
        {
            return Result<LinkAnalyticsDto>.Failure("Errors.SurveyLinkNotBelongToSurvey");
        }

        // Filter clicks by date range if specified
        var clicks = link.Clicks.AsEnumerable();
        if (request.StartDate.HasValue)
        {
            clicks = clicks.Where(c => c.ClickedAt >= request.StartDate.Value);
        }
        if (request.EndDate.HasValue)
        {
            clicks = clicks.Where(c => c.ClickedAt <= request.EndDate.Value);
        }

        var clickList = clicks.ToList();

        // Calculate analytics
        var totalClicks = clickList.Count;
        var uniqueClicks = clickList
            .Where(c => !string.IsNullOrEmpty(c.IpAddress))
            .Select(c => c.IpAddress)
            .Distinct()
            .Count();
        var totalResponses = clickList.Count(c => c.ResponseId.HasValue);
        var conversionRate = totalClicks > 0 ? (decimal)totalResponses / totalClicks * 100 : 0;

        // Group by country with percentage
        var countryGroups = clickList
            .Where(c => !string.IsNullOrEmpty(c.Country))
            .GroupBy(c => c.Country!)
            .Select(g => new ClicksByCountryDto
            {
                Country = g.Key,
                CountryCode = GetCountryCode(g.Key),
                Clicks = g.Count(),
                Percentage =
                    totalClicks > 0 ? Math.Round((decimal)g.Count() / totalClicks * 100, 2) : 0,
            })
            .OrderByDescending(x => x.Clicks)
            .ToList();

        // Group by device with percentage
        var deviceGroups = clickList
            .Where(c => !string.IsNullOrEmpty(c.DeviceType))
            .GroupBy(c => c.DeviceType!)
            .Select(g => new ClicksByDeviceDto
            {
                Device = g.Key,
                Clicks = g.Count(),
                Percentage =
                    totalClicks > 0 ? Math.Round((decimal)g.Count() / totalClicks * 100, 2) : 0,
            })
            .OrderByDescending(x => x.Clicks)
            .ToList();

        // Group by browser with percentage
        var browserGroups = clickList
            .Where(c => !string.IsNullOrEmpty(c.Browser))
            .GroupBy(c => c.Browser!)
            .Select(g => new ClicksByBrowserDto
            {
                Browser = g.Key,
                Clicks = g.Count(),
                Percentage =
                    totalClicks > 0 ? Math.Round((decimal)g.Count() / totalClicks * 100, 2) : 0,
            })
            .OrderByDescending(x => x.Clicks)
            .ToList();

        // Group by referrer with percentage
        var referrerGroups = clickList
            .Where(c => !string.IsNullOrEmpty(c.Referrer))
            .GroupBy(c => c.Referrer!)
            .Select(g => new ClicksByReferrerDto
            {
                Referrer = g.Key,
                Clicks = g.Count(),
                Percentage =
                    totalClicks > 0 ? Math.Round((decimal)g.Count() / totalClicks * 100, 2) : 0,
            })
            .OrderByDescending(x => x.Clicks)
            .Take(10)
            .ToList();

        // Top cities
        var topCities = clickList
            .Where(c => !string.IsNullOrEmpty(c.City) && !string.IsNullOrEmpty(c.Country))
            .GroupBy(c => new { c.City, c.Country })
            .Select(g => new TopCityDto
            {
                City = g.Key.City!,
                Country = g.Key.Country!,
                Clicks = g.Count(),
            })
            .OrderByDescending(x => x.Clicks)
            .Take(10)
            .ToList();

        // Generate clicks by date (last 30 days by default)
        var startDate = request.StartDate ?? DateTime.UtcNow.AddDays(-30);
        var endDate = request.EndDate ?? DateTime.UtcNow;
        var clicksByDate = new List<ClicksByDateDto>();

        for (var date = startDate.Date; date <= endDate.Date; date = date.AddDays(1))
        {
            var dayClicks = clickList.Where(c => c.ClickedAt.Date == date).ToList();
            var dayUniqueClicks = dayClicks
                .Where(c => !string.IsNullOrEmpty(c.IpAddress))
                .Select(c => c.IpAddress)
                .Distinct()
                .Count();
            clicksByDate.Add(
                new ClicksByDateDto
                {
                    Date = date.ToString("yyyy-MM-dd"),
                    Clicks = dayClicks.Count,
                    UniqueClicks = dayUniqueClicks,
                }
            );
        }

        var analytics = new LinkAnalyticsDto
        {
            LinkId = link.Id,
            LinkName = link.Name ?? link.Token,
            TotalClicks = totalClicks,
            UniqueClicks = uniqueClicks,
            TotalResponses = totalResponses,
            ConversionRate = Math.Round(conversionRate, 2),
            ClicksByDate = clicksByDate,
            ClicksByCountry = countryGroups,
            ClicksByDevice = deviceGroups,
            ClicksByBrowser = browserGroups,
            ClicksByReferrer = referrerGroups,
            TopCities = topCities,
        };

        return Result<LinkAnalyticsDto>.Success(analytics);
    }

    /// <summary>
    /// Gets a 2-letter country code from country name.
    /// Falls back to first 2 characters if not in the mapping.
    /// </summary>
    private static string GetCountryCode(string countryName)
    {
        // Common country name to ISO 3166-1 alpha-2 code mappings
        var countryCodeMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "United States", "US" },
            { "USA", "US" },
            { "United States of America", "US" },
            { "United Kingdom", "GB" },
            { "UK", "GB" },
            { "Great Britain", "GB" },
            { "Canada", "CA" },
            { "Australia", "AU" },
            { "Germany", "DE" },
            { "France", "FR" },
            { "Spain", "ES" },
            { "Italy", "IT" },
            { "Netherlands", "NL" },
            { "Belgium", "BE" },
            { "Switzerland", "CH" },
            { "Austria", "AT" },
            { "Poland", "PL" },
            { "Sweden", "SE" },
            { "Norway", "NO" },
            { "Denmark", "DK" },
            { "Finland", "FI" },
            { "Ireland", "IE" },
            { "Portugal", "PT" },
            { "Greece", "GR" },
            { "Czech Republic", "CZ" },
            { "Czechia", "CZ" },
            { "Japan", "JP" },
            { "China", "CN" },
            { "South Korea", "KR" },
            { "India", "IN" },
            { "Brazil", "BR" },
            { "Mexico", "MX" },
            { "Argentina", "AR" },
            { "Russia", "RU" },
            { "South Africa", "ZA" },
            { "New Zealand", "NZ" },
            { "Singapore", "SG" },
            { "Hong Kong", "HK" },
            { "Taiwan", "TW" },
            { "Indonesia", "ID" },
            { "Malaysia", "MY" },
            { "Philippines", "PH" },
            { "Thailand", "TH" },
            { "Vietnam", "VN" },
            { "Israel", "IL" },
            { "United Arab Emirates", "AE" },
            { "UAE", "AE" },
            { "Saudi Arabia", "SA" },
            { "Turkey", "TR" },
            { "Egypt", "EG" },
        };

        if (countryCodeMap.TryGetValue(countryName, out var code))
        {
            return code;
        }

        // Fall back to first 2 characters uppercase
        return countryName.Length >= 2
            ? countryName.Substring(0, 2).ToUpperInvariant()
            : countryName.ToUpperInvariant();
    }
}
