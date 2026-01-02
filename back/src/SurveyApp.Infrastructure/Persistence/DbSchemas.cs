namespace SurveyApp.Infrastructure.Persistence;

/// <summary>
/// Database schema constants for logical separation of entities.
/// PostgreSQL schemas provide namespace isolation for tables.
/// </summary>
public static class DbSchemas
{
    /// <summary>
    /// Identity schema for ASP.NET Identity tables (AspNetUsers, AspNetRoles, etc.)
    /// </summary>
    public const string Identity = "identity";

    /// <summary>
    /// Core schema for main business entities (Users, Namespaces, NamespaceMemberships, UserPreferences)
    /// </summary>
    public const string Core = "core";

    /// <summary>
    /// Survey schema for survey-related entities (Surveys, Questions, QuestionLogics, Responses, Answers)
    /// </summary>
    public const string Survey = "survey";

    /// <summary>
    /// Templates schema for reusable survey templates (SurveyTemplates, TemplateQuestions)
    /// </summary>
    public const string Templates = "templates";

    /// <summary>
    /// Themes schema for survey themes and branding (SurveyThemes)
    /// </summary>
    public const string Themes = "themes";

    /// <summary>
    /// Distribution schema for email distribution entities (EmailTemplates, EmailDistributions, EmailRecipients, SurveyLinks, LinkClicks)
    /// </summary>
    public const string Distribution = "distribution";

    /// <summary>
    /// Scheduling schema for recurring survey entities (RecurringSurveys, RecurringSurveyRuns)
    /// </summary>
    public const string Scheduling = "scheduling";

    /// <summary>
    /// Internationalization schema for all translation entities
    /// </summary>
    public const string I18n = "i18n";

    /// <summary>
    /// All schema names for migration purposes
    /// </summary>
    public static readonly string[] AllSchemas =
    [
        Identity,
        Core,
        Survey,
        Templates,
        Themes,
        Distribution,
        Scheduling,
        I18n,
    ];
}
