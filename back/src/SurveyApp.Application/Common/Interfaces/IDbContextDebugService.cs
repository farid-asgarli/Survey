namespace SurveyApp.Application.Common.Interfaces;

/// <summary>
/// Debug service to inspect DbContext state for troubleshooting.
/// </summary>
public interface IDbContextDebugService
{
    /// <summary>
    /// Gets a string representation of all tracked entities and their states.
    /// </summary>
    string GetTrackedEntitiesDebugInfo();

    /// <summary>
    /// Checks if a SurveyResponse exists in the database (bypassing query filters).
    /// </summary>
    Task<(bool Exists, bool IsDeleted, string? DebugInfo)> CheckResponseExistsAsync(
        Guid responseId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Checks if a SurveyLink exists in the database (bypassing query filters).
    /// </summary>
    Task<(bool Exists, bool IsDeleted, string? DebugInfo)> CheckLinkExistsAsync(
        Guid linkId,
        CancellationToken cancellationToken = default
    );
}
