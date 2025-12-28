namespace SurveyApp.Domain.Enums;

/// <summary>
/// Represents the role of a user within a namespace.
/// </summary>
public enum NamespaceRole
{
    /// <summary>
    /// Full control over the namespace including deletion.
    /// </summary>
    Owner = 0,

    /// <summary>
    /// Administrative access to manage surveys, users, and settings.
    /// </summary>
    Admin = 1,

    /// <summary>
    /// Can create and manage their own surveys.
    /// </summary>
    Member = 2,

    /// <summary>
    /// Read-only access to surveys and responses.
    /// </summary>
    Viewer = 3,

    /// <summary>
    /// Can only respond to surveys.
    /// </summary>
    Respondent = 4,
}
