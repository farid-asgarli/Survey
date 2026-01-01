using Ardalis.Specification;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Specifications.Base;

namespace SurveyApp.Domain.Specifications.Responses;

/// <summary>
/// Filter criteria for response queries.
/// </summary>
public record ResponseFilterCriteria
{
    /// <summary>
    /// Gets or sets the survey ID (required).
    /// </summary>
    public Guid SurveyId { get; init; }

    /// <summary>
    /// Gets or sets the optional completion status filter.
    /// </summary>
    public bool? IsComplete { get; init; }

    /// <summary>
    /// Gets or sets the optional start date filter.
    /// </summary>
    public DateTime? FromDate { get; init; }

    /// <summary>
    /// Gets or sets the optional end date filter.
    /// </summary>
    public DateTime? ToDate { get; init; }

    /// <summary>
    /// Gets or sets the optional respondent email filter.
    /// </summary>
    public string? RespondentEmail { get; init; }

    /// <summary>
    /// Gets or sets whether to include incomplete responses.
    /// </summary>
    public bool IncludeIncomplete { get; init; } = false;

    /// <summary>
    /// Gets or sets the sorting parameters.
    /// </summary>
    public SortingParameters Sorting { get; init; } = SortingParameters.Default;

    /// <summary>
    /// Gets or sets the paging parameters.
    /// </summary>
    public PagingParameters? Paging { get; init; }

    /// <summary>
    /// Gets or sets whether to include answers.
    /// </summary>
    public bool IncludeAnswers { get; init; } = true;
}

/// <summary>
/// Specification for querying responses with comprehensive filtering and paging.
/// </summary>
public sealed class ResponsesFilteredSpec : BaseSpecification<SurveyResponse>
{
    public ResponsesFilteredSpec(ResponseFilterCriteria criteria)
    {
        // Base survey filter
        Query.Where(r => r.SurveyId == criteria.SurveyId);

        // Include related data
        Query.Include(r => r.Respondent);

        if (criteria.IncludeAnswers)
        {
            Query.Include(r => r.Answers);
        }

        // Apply completion filter
        if (!criteria.IncludeIncomplete)
        {
            Query.Where(r => r.IsComplete);
        }
        else if (criteria.IsComplete.HasValue)
        {
            Query.Where(r => r.IsComplete == criteria.IsComplete.Value);
        }

        // Apply date range filters
        if (criteria.FromDate.HasValue)
        {
            Query.Where(r => r.StartedAt >= criteria.FromDate.Value);
        }

        if (criteria.ToDate.HasValue)
        {
            var endDate = criteria.ToDate.Value.Date.AddDays(1);
            Query.Where(r => r.StartedAt < endDate);
        }

        // Apply email filter
        if (!string.IsNullOrEmpty(criteria.RespondentEmail))
        {
            var emailPattern = criteria.RespondentEmail.ToLower();
            Query.Where(r =>
                r.RespondentEmail != null && r.RespondentEmail.ToLower().Contains(emailPattern)
            );
        }

        // Apply sorting
        ApplySorting(criteria.Sorting);

        // Apply paging
        if (criteria.Paging != null)
        {
            ApplyPaging(criteria.Paging);
        }

        AsReadOnly();
    }

    private void ApplySorting(SortingParameters sorting)
    {
        switch (sorting.NormalizedSortBy)
        {
            case "startedat":
                if (sorting.SortDescending)
                    Query.OrderByDescending(r => r.StartedAt);
                else
                    Query.OrderBy(r => r.StartedAt);
                break;

            case "email":
            case "respondentemail":
                if (sorting.SortDescending)
                    Query.OrderByDescending(r => r.RespondentEmail);
                else
                    Query.OrderBy(r => r.RespondentEmail);
                break;

            case "timespent":
            case "timespentseconds":
                if (sorting.SortDescending)
                    Query.OrderByDescending(r => r.TimeSpentSeconds);
                else
                    Query.OrderBy(r => r.TimeSpentSeconds);
                break;

            case "iscomplete":
                if (sorting.SortDescending)
                    Query.OrderByDescending(r => r.IsComplete);
                else
                    Query.OrderBy(r => r.IsComplete);
                break;

            default: // Default: submittedAt
                if (sorting.SortDescending)
                    Query.OrderByDescending(r => r.SubmittedAt);
                else
                    Query.OrderBy(r => r.SubmittedAt);
                break;
        }
    }
}

/// <summary>
/// Specification for querying responses by survey (simple list).
/// </summary>
public sealed class ResponsesBySurveySpec : BaseSpecification<SurveyResponse>
{
    public ResponsesBySurveySpec(Guid surveyId, bool completedOnly = false)
    {
        Query.Where(r => r.SurveyId == surveyId);

        if (completedOnly)
        {
            Query.Where(r => r.IsComplete);
        }

        Query.Include(r => r.Respondent).Include(r => r.Answers);

        Query.OrderByDescending(r => r.SubmittedAt);

        AsReadOnly();
    }
}

/// <summary>
/// Specification for querying responses by respondent email.
/// </summary>
public sealed class ResponsesByEmailSpec : BaseSpecification<SurveyResponse>
{
    public ResponsesByEmailSpec(Guid surveyId, string email)
    {
        Query.Where(r => r.SurveyId == surveyId && r.RespondentEmail == email);

        Query.Include(r => r.Respondent).Include(r => r.Answers);

        Query.OrderByDescending(r => r.SubmittedAt);

        AsReadOnly();
    }
}

/// <summary>
/// Specification for checking if a respondent has already responded to a survey.
/// </summary>
public sealed class HasRespondedSpec : BaseSpecification<SurveyResponse>
{
    public HasRespondedSpec(Guid surveyId, string email)
    {
        Query.Where(r => r.SurveyId == surveyId && r.RespondentEmail == email && r.IsComplete);

        AsReadOnly();
    }
}

/// <summary>
/// Specification for counting responses.
/// </summary>
public sealed class ResponseCountSpec : BaseSpecification<SurveyResponse>
{
    public ResponseCountSpec(Guid surveyId, bool completedOnly = true)
    {
        Query.Where(r => r.SurveyId == surveyId);

        if (completedOnly)
        {
            Query.Where(r => r.IsComplete);
        }
    }
}

/// <summary>
/// Specification for retrieving responses for export with filtering.
/// </summary>
public sealed class ResponsesForExportSpec : BaseSpecification<SurveyResponse>
{
    public ResponsesForExportSpec(ResponseFilterCriteria criteria)
    {
        Query.Where(r => r.SurveyId == criteria.SurveyId);

        Query.Include(r => r.Respondent).Include(r => r.Answers);

        // Apply completion filter
        if (!criteria.IncludeIncomplete)
        {
            Query.Where(r => r.IsComplete);
        }
        else if (criteria.IsComplete.HasValue)
        {
            Query.Where(r => r.IsComplete == criteria.IsComplete.Value);
        }

        // Apply date range
        if (criteria.FromDate.HasValue)
        {
            Query.Where(r => r.StartedAt >= criteria.FromDate.Value);
        }

        if (criteria.ToDate.HasValue)
        {
            Query.Where(r => r.StartedAt <= criteria.ToDate.Value);
        }

        // Apply email filter
        if (!string.IsNullOrEmpty(criteria.RespondentEmail))
        {
            var emailPattern = criteria.RespondentEmail.ToLower();
            Query.Where(r =>
                r.RespondentEmail != null && r.RespondentEmail.ToLower().Contains(emailPattern)
            );
        }

        Query.OrderByDescending(r => r.SubmittedAt);

        AsReadOnly();
    }
}

/// <summary>
/// Specification for retrieving responses for analytics.
/// </summary>
public sealed class ResponsesForAnalyticsSpec : BaseSpecification<SurveyResponse>
{
    public ResponsesForAnalyticsSpec(Guid surveyId)
    {
        Query.Where(r => r.SurveyId == surveyId);

        Query.Include(r => r.Answers);

        AsReadOnly();
    }
}
