using Ardalis.Specification;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Specifications.Base;

namespace SurveyApp.Domain.Specifications.Responses;

/// <summary>
/// Specification for retrieving a response by its ID.
/// </summary>
public sealed class ResponseByIdSpec : BaseSpecification<SurveyResponse>
{
    public ResponseByIdSpec(Guid id, bool includeAnswers = false)
    {
        Query.Where(r => r.Id == id);

        Query.Include(r => r.Survey).Include(r => r.Respondent);

        if (includeAnswers)
        {
            Query
                .Include(r => r.Answers)
                .ThenInclude(a => a.Question)
                .ThenInclude(q => q.Translations);
        }

        AsReadOnly();
    }
}

/// <summary>
/// Specification for retrieving a response by its ID with change tracking for updates.
/// </summary>
public sealed class ResponseByIdForUpdateSpec : BaseSpecification<SurveyResponse>
{
    public ResponseByIdForUpdateSpec(Guid id, bool includeAnswers = false)
    {
        Query.Where(r => r.Id == id);

        Query.Include(r => r.Respondent);

        if (includeAnswers)
        {
            Query.Include(r => r.Answers);
        }

        // Keep tracking enabled for updates
    }
}

/// <summary>
/// Specification for retrieving a response with answers.
/// </summary>
public sealed class ResponseWithAnswersSpec : BaseSpecification<SurveyResponse>
{
    public ResponseWithAnswersSpec(Guid id)
    {
        Query.Where(r => r.Id == id);

        Query
            .Include(r => r.Survey)
            .Include(r => r.Respondent)
            .Include(r => r.Answers)
            .ThenInclude(a => a.Question)
            .ThenInclude(q => q.Translations);

        AsReadOnly();
    }
}
