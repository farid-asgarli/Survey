using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Services;

public interface IAnalyticsService
{
    Task<SurveyAnalyticsDto> GetSurveyAnalyticsAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    );
    Task<NamespaceAnalytics> GetNamespaceAnalyticsAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    );
    Task<ExportResult> ExportResponsesAsync(
        Guid surveyId,
        ExportFormat format,
        CancellationToken cancellationToken = default
    );
    Task<TrendAnalytics> GetResponseTrendsAsync(
        Guid surveyId,
        DateTime fromDate,
        DateTime toDate,
        CancellationToken cancellationToken = default
    );
}

public record NamespaceAnalytics
{
    public Guid NamespaceId { get; init; }
    public int TotalSurveys { get; init; }
    public int ActiveSurveys { get; init; }
    public int TotalResponses { get; init; }
    public int ResponsesThisMonth { get; init; }
    public double AverageResponseRate { get; init; }
    public Dictionary<string, int> SurveysByStatus { get; init; } = [];
    public Dictionary<DateTime, int> ResponsesByDate { get; init; } = [];
}

public record ExportResult
{
    public byte[] Data { get; init; } = [];
    public string FileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
}

public enum ExportFormat
{
    Csv,
    Excel,
    Json,
    Pdf
}

public record TrendAnalytics
{
    public Guid SurveyId { get; init; }
    public DateTime FromDate { get; init; }
    public DateTime ToDate { get; init; }
    public int TotalResponses { get; init; }
    public double AverageResponsesPerDay { get; init; }
    public Dictionary<DateTime, int> DailyResponses { get; init; } = [];
    public Dictionary<int, int> ResponsesByHour { get; init; } = [];
    public Dictionary<DayOfWeek, int> ResponsesByDayOfWeek { get; init; } = [];
}
