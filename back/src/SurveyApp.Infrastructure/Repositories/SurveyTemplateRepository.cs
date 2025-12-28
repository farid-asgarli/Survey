using Microsoft.EntityFrameworkCore;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Infrastructure.Persistence;

namespace SurveyApp.Infrastructure.Repositories;

public class SurveyTemplateRepository(ApplicationDbContext context) : ISurveyTemplateRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<SurveyTemplate?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context.SurveyTemplates.FirstOrDefaultAsync(
            t => t.Id == id,
            cancellationToken
        );
    }

    public async Task<SurveyTemplate?> GetByIdWithQuestionsAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyTemplates.Include(t => t.Questions.OrderBy(q => q.Order))
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<SurveyTemplate>> GetByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyTemplates.Include(t => t.Questions)
            .Where(t => t.NamespaceId == namespaceId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SurveyTemplate>> GetPublicByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyTemplates.Include(t => t.Questions)
            .Where(t => t.NamespaceId == namespaceId && t.IsPublic)
            .OrderByDescending(t => t.UsageCount)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SurveyTemplate>> GetByCategoryAsync(
        Guid namespaceId,
        string category,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyTemplates.Include(t => t.Questions)
            .Where(t => t.NamespaceId == namespaceId && t.Category == category)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SurveyTemplate>> GetByCreatorAsync(
        Guid namespaceId,
        Guid creatorId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyTemplates.Include(t => t.Questions)
            .Where(t => t.NamespaceId == namespaceId && t.CreatedBy == creatorId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<SurveyTemplate> Items, int TotalCount)> GetPagedAsync(
        Guid namespaceId,
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        string? category = null,
        bool? isPublic = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = _context
            .SurveyTemplates.Include(t => t.Questions)
            .Where(t => t.NamespaceId == namespaceId);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(t =>
                t.Name.ToLower().Contains(term)
                || (t.Description != null && t.Description.ToLower().Contains(term))
            );
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(t => t.Category == category);
        }

        if (isPublic.HasValue)
        {
            query = query.Where(t => t.IsPublic == isPublic.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<IReadOnlyList<string>> GetCategoriesAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyTemplates.Where(t => t.NamespaceId == namespaceId && t.Category != null)
            .Select(t => t.Category!)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync(cancellationToken);
    }

    public async Task<SurveyTemplate> AddAsync(
        SurveyTemplate template,
        CancellationToken cancellationToken = default
    )
    {
        await _context.SurveyTemplates.AddAsync(template, cancellationToken);
        return template;
    }

    public void Update(SurveyTemplate template)
    {
        _context.SurveyTemplates.Update(template);
    }

    public void Delete(SurveyTemplate template)
    {
        _context.SurveyTemplates.Remove(template);
    }

    public async Task<bool> ExistsByNameAsync(
        Guid namespaceId,
        string name,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = _context.SurveyTemplates.Where(t =>
            t.NamespaceId == namespaceId && t.Name == name
        );

        if (excludeId.HasValue)
        {
            query = query.Where(t => t.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }
}
