using Microsoft.EntityFrameworkCore;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Infrastructure.Persistence;

namespace SurveyApp.Infrastructure.Repositories;

public class NamespaceRepository(ApplicationDbContext context) : INamespaceRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<Namespace?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Namespaces.Include(n => n.Memberships)
            .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);
    }

    public async Task<Namespace?> GetBySlugAsync(
        string slug,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Namespaces.Include(n => n.Memberships)
            .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(n => n.Slug == slug, cancellationToken);
    }

    public async Task<Namespace?> GetWithMembersAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Namespaces.Include(n => n.Memberships)
            .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Namespace>> GetAllAsync(
        CancellationToken cancellationToken = default
    )
    {
        return await _context.Namespaces.Include(n => n.Memberships).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Namespace>> GetByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Namespaces.Include(n => n.Memberships)
            .Where(n => n.Memberships.Any(m => m.UserId == userId))
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> SlugExistsAsync(
        string slug,
        CancellationToken cancellationToken = default
    )
    {
        return await _context.Namespaces.AnyAsync(n => n.Slug == slug, cancellationToken);
    }

    public async Task<Namespace> AddAsync(
        Namespace @namespace,
        CancellationToken cancellationToken = default
    )
    {
        await _context.Namespaces.AddAsync(@namespace, cancellationToken);
        return @namespace;
    }

    public void Update(Namespace @namespace)
    {
        _context.Namespaces.Update(@namespace);
    }

    public void Delete(Namespace @namespace)
    {
        _context.Namespaces.Remove(@namespace);
    }
}
