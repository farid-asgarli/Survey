using SurveyApp.Domain.Entities;

namespace SurveyApp.Domain.Interfaces;

/// <summary>
/// Repository interface for User entities.
/// </summary>
public interface IUserRepository
{
    /// <summary>
    /// Gets a user by their ID.
    /// </summary>
    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a user by their email.
    /// </summary>
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a user with their namespace memberships.
    /// </summary>
    Task<User?> GetWithMembershipsAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all users in a namespace.
    /// </summary>
    Task<IReadOnlyList<User>> GetByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Checks if an email already exists.
    /// </summary>
    Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new user.
    /// </summary>
    Task<User> AddAsync(User user, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing user.
    /// </summary>
    void Update(User user);

    /// <summary>
    /// Deletes a user.
    /// </summary>
    void Delete(User user);
}
