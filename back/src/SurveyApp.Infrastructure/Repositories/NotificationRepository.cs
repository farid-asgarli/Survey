using Microsoft.EntityFrameworkCore;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Infrastructure.Persistence;

namespace SurveyApp.Infrastructure.Repositories;

public class NotificationRepository(ApplicationDbContext context) : INotificationRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<Notification?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Notifications.AsNoTracking()
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);
    }

    public async Task<(IReadOnlyList<Notification> Items, int TotalCount)> GetByUserIdPagedAsync(
        Guid userId,
        int pageNumber,
        int pageSize,
        bool includeRead = true,
        bool includeArchived = false,
        CancellationToken cancellationToken = default
    )
    {
        var query = _context.Notifications.AsNoTracking().Where(n => n.UserId == userId);

        if (!includeArchived)
        {
            query = query.Where(n => !n.IsArchived);
        }

        if (!includeRead)
        {
            query = query.Where(n => !n.IsRead);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<int> GetUnreadCountAsync(
        Guid userId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Notifications.AsNoTracking()
            .Where(n => n.UserId == userId && !n.IsRead && !n.IsArchived)
            .CountAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Notification>> GetRecentUnreadAsync(
        Guid userId,
        int count = 5,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Notifications.AsNoTracking()
            .Where(n => n.UserId == userId && !n.IsRead && !n.IsArchived)
            .OrderByDescending(n => n.CreatedAt)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<Notification> AddAsync(
        Notification notification,
        CancellationToken cancellationToken = default
    )
    {
        await _context.Notifications.AddAsync(notification, cancellationToken);
        return notification;
    }

    public async Task AddRangeAsync(
        IEnumerable<Notification> notifications,
        CancellationToken cancellationToken = default
    )
    {
        await _context.Notifications.AddRangeAsync(notifications, cancellationToken);
    }

    public void Update(Notification notification)
    {
        _context.Notifications.Update(notification);
    }

    public async Task MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        await _context
            .Notifications.Where(n => n.UserId == userId && !n.IsRead && !n.IsArchived)
            .ExecuteUpdateAsync(
                setters =>
                    setters
                        .SetProperty(n => n.IsRead, true)
                        .SetProperty(n => n.ReadAt, DateTime.UtcNow),
                cancellationToken
            );
    }

    public async Task ArchiveOldNotificationsAsync(
        Guid userId,
        DateTime olderThan,
        CancellationToken cancellationToken = default
    )
    {
        await _context
            .Notifications.Where(n =>
                n.UserId == userId && n.CreatedAt < olderThan && !n.IsArchived
            )
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(n => n.IsArchived, true),
                cancellationToken
            );
    }

    public async Task<IReadOnlyList<Notification>> GetByTypeAsync(
        Guid userId,
        NotificationType type,
        int count = 10,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Notifications.AsNoTracking()
            .Where(n => n.UserId == userId && n.Type == type && !n.IsArchived)
            .OrderByDescending(n => n.CreatedAt)
            .Take(count)
            .ToListAsync(cancellationToken);
    }
}
