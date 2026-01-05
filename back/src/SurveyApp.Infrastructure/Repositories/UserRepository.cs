using Microsoft.EntityFrameworkCore;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Infrastructure.Persistence;

namespace SurveyApp.Infrastructure.Repositories;

public class UserRepository(ApplicationDbContext context) : IUserRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context
            .Users.AsNoTracking()
            .Include(u => u.Memberships)
            .ThenInclude(m => m.Namespace)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task<User?> GetByIdForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        // No AsNoTracking() - enables change tracking for updates
        return await _context
            .Users.Include(u => u.Memberships)
            .ThenInclude(m => m.Namespace)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task<User?> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Users.AsNoTracking()
            .Include(u => u.Memberships)
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<User?> GetWithMembershipsAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Users.AsNoTracking()
            .Include(u => u.Memberships)
            .ThenInclude(m => m.Namespace)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<User>> GetByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Users.AsNoTracking()
            .Include(u => u.Memberships)
            .Where(u => u.Memberships.Any(m => m.NamespaceId == namespaceId))
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> EmailExistsAsync(
        string email,
        CancellationToken cancellationToken = default
    )
    {
        return await _context.Users.AnyAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<User> AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await _context.Users.AddAsync(user, cancellationToken);
        return user;
    }

    public void Update(User user)
    {
        _context.Users.Update(user);
    }

    public void Delete(User user)
    {
        _context.Users.Remove(user);
    }

    public async Task<IReadOnlyList<User>> SearchAsync(
        string query,
        int maxResults = 10,
        CancellationToken cancellationToken = default
    )
    {
        if (string.IsNullOrWhiteSpace(query))
            return [];

        var normalizedQuery = query.Trim().ToLower();

        return await _context
            .Users.AsNoTracking()
            .Where(u =>
                u.Email.ToLower().Contains(normalizedQuery)
                || u.FirstName.ToLower().Contains(normalizedQuery)
                || u.LastName.ToLower().Contains(normalizedQuery)
                || (u.FirstName + " " + u.LastName).ToLower().Contains(normalizedQuery)
            )
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .Take(maxResults)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<User>> SearchForNamespaceInviteAsync(
        string query,
        Guid namespaceId,
        int maxResults = 10,
        CancellationToken cancellationToken = default
    )
    {
        if (string.IsNullOrWhiteSpace(query))
            return [];

        var normalizedQuery = query.Trim().ToLower();

        // Get users who are NOT already members of this namespace
        return await _context
            .Users.AsNoTracking()
            .Where(u =>
                !u.Memberships.Any(m => m.NamespaceId == namespaceId)
                && (
                    u.Email.ToLower().Contains(normalizedQuery)
                    || u.FirstName.ToLower().Contains(normalizedQuery)
                    || u.LastName.ToLower().Contains(normalizedQuery)
                    || (u.FirstName + " " + u.LastName).ToLower().Contains(normalizedQuery)
                )
            )
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .Take(maxResults)
            .ToListAsync(cancellationToken);
    }
}
