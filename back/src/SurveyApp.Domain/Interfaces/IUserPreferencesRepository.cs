using SurveyApp.Domain.Entities;

namespace SurveyApp.Domain.Interfaces;

/// <summary>
/// Repository interface for UserPreferences entities.
/// </summary>
public interface IUserPreferencesRepository
{
    /// <summary>
    /// Gets user preferences by user ID.
    /// </summary>
    Task<UserPreferences?> GetByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets user preferences by ID.
    /// </summary>
    Task<UserPreferences?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds new user preferences.
    /// Returns null if the user doesn't exist in the Users table.
    /// </summary>
    Task<UserPreferences?> AddAsync(
        UserPreferences preferences,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Updates existing user preferences.
    /// </summary>
    void Update(UserPreferences preferences);

    /// <summary>
    /// Gets or creates user preferences for a user.
    /// Creates default preferences if none exist.
    /// Returns null if the user doesn't exist in the Users table.
    /// </summary>
    Task<UserPreferences?> GetOrCreateAsync(
        Guid userId,
        CancellationToken cancellationToken = default
    );
}
