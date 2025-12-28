using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.RecurringSurveys.Queries.GetUpcomingRuns;

/// <summary>
/// Handler for GetUpcomingRunsQuery.
/// </summary>
public class GetUpcomingRunsQueryHandler(
    IRecurringSurveyRepository recurringSurveyRepository,
    ISurveyRepository surveyRepository,
    INamespaceContext namespaceContext
) : IRequestHandler<GetUpcomingRunsQuery, Result<IReadOnlyList<UpcomingRunDto>>>
{
    private readonly IRecurringSurveyRepository _recurringSurveyRepository =
        recurringSurveyRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;

    public async Task<Result<IReadOnlyList<UpcomingRunDto>>> Handle(
        GetUpcomingRunsQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<IReadOnlyList<UpcomingRunDto>>.Failure("Namespace context is required.");
        }

        var recurringSurveys = await _recurringSurveyRepository.GetUpcomingRunsAsync(
            namespaceId.Value,
            request.Count,
            cancellationToken
        );

        // Get survey titles
        var surveyIds = recurringSurveys.Select(r => r.SurveyId).Distinct().ToList();
        var surveys = new Dictionary<Guid, string>();
        foreach (var surveyId in surveyIds)
        {
            var survey = await _surveyRepository.GetByIdAsync(surveyId, cancellationToken);
            if (survey != null)
            {
                surveys[surveyId] = survey.Title;
            }
        }

        var dtos = recurringSurveys
            .Where(r => r.NextRunAt.HasValue)
            .OrderBy(r => r.NextRunAt)
            .Take(request.Count)
            .Select(r => new UpcomingRunDto
            {
                RecurringSurveyId = r.Id,
                RecurringSurveyName = r.Name,
                SurveyTitle = surveys.GetValueOrDefault(r.SurveyId, "Unknown"),
                ScheduledAt = r.NextRunAt!.Value,
                EstimatedRecipients = r.RecipientEmails.Length,
            })
            .ToList();

        return Result<IReadOnlyList<UpcomingRunDto>>.Success(dtos);
    }
}
