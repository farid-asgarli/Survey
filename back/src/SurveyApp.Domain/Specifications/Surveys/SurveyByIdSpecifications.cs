using Ardalis.Specification;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Specifications.Base;

namespace SurveyApp.Domain.Specifications.Surveys;

/// <summary>
/// Specification for retrieving a survey by its ID.
/// </summary>
public sealed class SurveyByIdSpec : BaseSpecification<Survey>
{
    public SurveyByIdSpec(Guid id, bool includeNamespace = true, bool includeTranslations = true)
    {
        Query.Where(s => s.Id == id);

        if (includeNamespace)
        {
            Query.Include(s => s.Namespace);
        }

        if (includeTranslations)
        {
            Query.Include(s => s.Translations);
        }

        AsReadOnly();
    }
}

/// <summary>
/// Specification for retrieving a survey by its ID with change tracking enabled for updates.
/// </summary>
public sealed class SurveyByIdForUpdateSpec : BaseSpecification<Survey>
{
    public SurveyByIdForUpdateSpec(
        Guid id,
        bool includeNamespace = true,
        bool includeTranslations = true
    )
    {
        Query.Where(s => s.Id == id);

        if (includeNamespace)
        {
            Query.Include(s => s.Namespace);
        }

        if (includeTranslations)
        {
            Query.Include(s => s.Translations);
        }

        // Do not call AsReadOnly() - keep change tracking enabled
    }
}

/// <summary>
/// Specification for retrieving a survey by its ID with questions loaded.
/// </summary>
public sealed class SurveyWithQuestionsSpec : BaseSpecification<Survey>
{
    public SurveyWithQuestionsSpec(Guid id, bool forUpdate = false)
    {
        Query.Where(s => s.Id == id);

        Query
            .Include(s => s.Namespace)
            .Include(s => s.Translations)
            .Include(s => s.Questions.OrderBy(q => q.Order))
            .ThenInclude(q => q.Translations);

        if (!forUpdate)
        {
            AsReadOnly();
        }
    }
}

/// <summary>
/// Specification for retrieving a survey by its access token (for public access).
/// </summary>
public sealed class SurveyByAccessTokenSpec : BaseSpecification<Survey>
{
    public SurveyByAccessTokenSpec(string accessToken, bool includeTheme = false)
    {
        Query.Where(s => s.AccessToken == accessToken);

        Query
            .Include(s => s.Translations)
            .Include(s => s.Questions.OrderBy(q => q.Order))
            .ThenInclude(q => q.Translations);

        if (includeTheme)
        {
            Query.Include(s => s.Theme).ThenInclude(t => t!.Translations);
        }

        AsReadOnly();
    }
}

/// <summary>
/// Specification for retrieving a survey for public display with theme.
/// </summary>
public sealed class SurveyForPublicSpec : BaseSpecification<Survey>
{
    public SurveyForPublicSpec(Guid id)
    {
        Query.Where(s => s.Id == id);

        Query
            .Include(s => s.Translations)
            .Include(s => s.Questions.OrderBy(q => q.Order))
            .ThenInclude(q => q.Translations)
            .Include(s => s.Theme)
            .ThenInclude(t => t!.Translations);

        AsReadOnly();
    }
}
