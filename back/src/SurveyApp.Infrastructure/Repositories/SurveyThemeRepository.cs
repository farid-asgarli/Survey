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
        return await _context
            .SurveyThemes.AsNoTracking()
            .Include(t => t.Translations)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<SurveyTheme?> GetByIdForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        // No AsNoTracking() - enables change tracking for updates
        return await _context
            .SurveyThemes.Include(t => t.Translations)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<SurveyTheme>> GetByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyThemes.AsNoTracking()
            .Include(t => t.Translations)
            .Where(t => t.NamespaceId == namespaceId)
            .OrderByDescending(t => t.IsDefault)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<SurveyTheme?> GetDefaultByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyThemes.AsNoTracking()
            .Include(t => t.Translations)
            .FirstOrDefaultAsync(
                t => t.NamespaceId == namespaceId && t.IsDefault,
                cancellationToken
            );
    }

    public async Task<SurveyTheme?> GetDefaultByNamespaceIdForUpdateAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    )
    {
        // No AsNoTracking() - enables change tracking for updates
        return await _context
            .SurveyThemes.Include(t => t.Translations)
            .FirstOrDefaultAsync(
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
            .SurveyThemes.AsNoTracking()
            .Include(t => t.Translations)
            .Where(t => t.NamespaceId == namespaceId && t.IsPublic)
            .OrderByDescending(t => t.IsDefault)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsByNameAsync(
        Guid namespaceId,
        string name,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default
    )
    {
        // Query through translations table since Name is a computed property
        var query = _context.SurveyThemeTranslations.Where(t =>
            t.Theme.NamespaceId == namespaceId && t.Name == name
        );

        if (excludeId.HasValue)
        {
            query = query.Where(t => t.ThemeId != excludeId.Value);
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
        var query = _context
            .SurveyThemes.AsNoTracking()
            .Include(t => t.Translations)
            .Where(t => t.NamespaceId == namespaceId);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            // Query through translations table since Name/Description are computed properties
            var matchingThemeIds = await _context
                .SurveyThemeTranslations.Where(t =>
                    t.Name.Contains(searchTerm)
                    || (t.Description != null && t.Description.Contains(searchTerm))
                )
                .Select(t => t.ThemeId)
                .Distinct()
                .ToListAsync(cancellationToken);

            query = query.Where(t => matchingThemeIds.Contains(t.Id));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(t => t.IsDefault)
            .ThenByDescending(t => t.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<(IReadOnlyList<SurveyTheme> Items, int TotalCount)> GetPublicThemesPagedAsync(
        Guid namespaceId,
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = _context
            .SurveyThemes.AsNoTracking()
            .Include(t => t.Translations)
            .Where(t => t.NamespaceId == namespaceId && t.IsPublic);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var matchingThemeIds = await _context
                .SurveyThemeTranslations.Where(t =>
                    t.Name.Contains(searchTerm)
                    || (t.Description != null && t.Description.Contains(searchTerm))
                )
                .Select(t => t.ThemeId)
                .Distinct()
                .ToListAsync(cancellationToken);

            query = query.Where(t => matchingThemeIds.Contains(t.Id));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(t => t.IsDefault)
            .ThenByDescending(t => t.CreatedAt)
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
