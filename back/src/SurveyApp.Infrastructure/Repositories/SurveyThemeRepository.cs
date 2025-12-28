using Microsoft.EntityFrameworkCore;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Infrastructure.Persistence;

namespace SurveyApp.Infrastructure.Repositories;

public class SurveyThemeRepository(ApplicationDbContext context) : ISurveyThemeRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<SurveyTheme?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context.SurveyThemes.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<SurveyTheme>> GetByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyThemes.Where(t => t.NamespaceId == namespaceId)
            .OrderByDescending(t => t.IsDefault)
            .ThenBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<SurveyTheme?> GetDefaultByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context.SurveyThemes.FirstOrDefaultAsync(
            t => t.NamespaceId == namespaceId && t.IsDefault,
            cancellationToken
        );
    }

    public async Task<IReadOnlyList<SurveyTheme>> GetPublicThemesByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyThemes.Where(t => t.NamespaceId == namespaceId && t.IsPublic)
            .OrderByDescending(t => t.IsDefault)
            .ThenBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsByNameAsync(
        Guid namespaceId,
        string name,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = _context.SurveyThemes.Where(t =>
            t.NamespaceId == namespaceId && t.Name == name
        );

        if (excludeId.HasValue)
        {
            query = query.Where(t => t.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<SurveyTheme> Items, int TotalCount)> GetPagedAsync(
        Guid namespaceId,
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = _context.SurveyThemes.Where(t => t.NamespaceId == namespaceId);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(t =>
                t.Name.Contains(searchTerm)
                || (t.Description != null && t.Description.Contains(searchTerm))
            );
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(t => t.IsDefault)
            .ThenBy(t => t.Name)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public void Add(SurveyTheme theme)
    {
        _context.SurveyThemes.Add(theme);
    }

    public void Update(SurveyTheme theme)
    {
        _context.SurveyThemes.Update(theme);
    }

    public void Remove(SurveyTheme theme)
    {
        _context.SurveyThemes.Remove(theme);
    }
}
