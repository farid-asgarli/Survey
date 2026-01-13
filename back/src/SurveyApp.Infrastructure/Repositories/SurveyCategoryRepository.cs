using Microsoft.EntityFrameworkCore;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Infrastructure.Persistence;

namespace SurveyApp.Infrastructure.Repositories;

public class SurveyCategoryRepository(ApplicationDbContext context) : ISurveyCategoryRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<SurveyCategory?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyCategories.AsNoTracking()
            .Include(c => c.Translations)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<SurveyCategory?> GetByIdForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        // No AsNoTracking() - enables change tracking for updates
        return await _context
            .SurveyCategories.Include(c => c.Translations)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<SurveyCategory>> GetByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyCategories.AsNoTracking()
            .Include(c => c.Translations)
            .Where(c => c.NamespaceId == namespaceId)
            .OrderBy(c => c.DisplayOrder)
            .ThenByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SurveyCategory>> GetByNamespaceIdForUpdateAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    )
    {
        // No AsNoTracking() - enables change tracking for updates
        return await _context
            .SurveyCategories.Include(c => c.Translations)
            .Where(c => c.NamespaceId == namespaceId)
            .OrderBy(c => c.DisplayOrder)
            .ThenByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetSurveyCountAsync(
        Guid categoryId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Surveys.Where(s => s.CategoryId == categoryId && !s.IsDeleted)
            .CountAsync(cancellationToken);
    }

    public async Task<SurveyCategory?> GetDefaultByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyCategories.AsNoTracking()
            .Include(c => c.Translations)
            .FirstOrDefaultAsync(
                c => c.NamespaceId == namespaceId && c.IsDefault,
                cancellationToken
            );
    }

    public async Task<SurveyCategory?> GetDefaultByNamespaceIdForUpdateAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    )
    {
        // No AsNoTracking() - enables change tracking for updates
        return await _context
            .SurveyCategories.Include(c => c.Translations)
            .FirstOrDefaultAsync(
                c => c.NamespaceId == namespaceId && c.IsDefault,
                cancellationToken
            );
    }

    public async Task<bool> ExistsByNameAsync(
        Guid namespaceId,
        string name,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default
    )
    {
        // Query through translations table since Name is a computed property
        var query = _context.SurveyCategoryTranslations.Where(t =>
            t.Category.NamespaceId == namespaceId && t.Name == name
        );

        if (excludeId.HasValue)
        {
            query = query.Where(t => t.CategoryId != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<SurveyCategory> Items, int TotalCount)> GetPagedAsync(
        Guid namespaceId,
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = _context
            .SurveyCategories.AsNoTracking()
            .Include(c => c.Translations)
            .Where(c => c.NamespaceId == namespaceId);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            // Search in translations
            query = query.Where(c =>
                c.Translations.Any(t =>
                    t.Name.Contains(searchTerm)
                    || (t.Description != null && t.Description.Contains(searchTerm))
                )
            );
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(c => c.DisplayOrder)
            .ThenByDescending(c => c.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<
        IReadOnlyList<(SurveyCategory Category, int SurveyCount)>
    > GetWithSurveyCountsAsync(Guid namespaceId, CancellationToken cancellationToken = default)
    {
        var result = await _context
            .SurveyCategories.AsNoTracking()
            .Include(c => c.Translations)
            .Where(c => c.NamespaceId == namespaceId)
            .Select(c => new { Category = c, SurveyCount = c.Surveys.Count(s => !s.IsDeleted) })
            .OrderBy(x => x.Category.DisplayOrder)
            .ThenByDescending(x => x.Category.CreatedAt)
            .ToListAsync(cancellationToken);

        return result.Select(x => (x.Category, x.SurveyCount)).ToList();
    }

    public async Task<int> GetMaxDisplayOrderAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    )
    {
        var maxOrder = await _context
            .SurveyCategories.Where(c => c.NamespaceId == namespaceId)
            .MaxAsync(c => (int?)c.DisplayOrder, cancellationToken);

        return maxOrder ?? 0;
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.SurveyCategories.AnyAsync(c => c.Id == id, cancellationToken);
    }

    public void Add(SurveyCategory category)
    {
        _context.SurveyCategories.Add(category);
    }

    public void Remove(SurveyCategory category)
    {
        _context.SurveyCategories.Remove(category);
    }
}
