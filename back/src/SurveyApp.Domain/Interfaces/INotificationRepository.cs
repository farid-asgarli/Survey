using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;

namespace SurveyApp.Domain.Interfaces;

/// <summary>
/// Repository interface for notifications.
/// </summary>
public interface INotificationRepository
{
    /// <summary>
    /// Gets a notification by ID.
    /// </summary>
    Task<Notification?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets paginated notifications for a user.
    /// </summary>
    Task<(IReadOnlyList<Notification> Items, int TotalCount)> GetByUserIdPagedAsync(
        Guid userId,
        int pageNumber,
        int pageSize,
        bool includeRead = true,
        bool includeArchived = false,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets unread notification count for a user.
    /// </summary>
    Task<int> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets recent unread notifications for a user (for popover preview).
    /// </summary>
    Task<IReadOnlyList<Notification>> GetRecentUnreadAsync(
        Guid userId,
        int count = 5,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Adds a new notification.
    /// </summary>
    Task<Notification> AddAsync(
        Notification notification,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Adds multiple notifications (batch insert).
    /// </summary>
    Task AddRangeAsync(
        IEnumerable<Notification> notifications,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Updates a notification.
    /// </summary>
    void Update(Notification notification);

    /// <summary>
    /// Marks all notifications as read for a user.
    /// </summary>
    Task MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes (archives) notifications older than a specified date.
    /// </summary>
    Task ArchiveOldNotificationsAsync(
        Guid userId,
        DateTime olderThan,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets notifications by type for a user.
    /// </summary>
    Task<IReadOnlyList<Notification>> GetByTypeAsync(
        Guid userId,
        NotificationType type,
        int count = 10,
        CancellationToken cancellationToken = default
    );
}
