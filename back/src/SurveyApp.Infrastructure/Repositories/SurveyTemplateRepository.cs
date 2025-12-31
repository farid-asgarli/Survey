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
        return await _context
            .SurveyTemplates.AsNoTracking()
            .Include(t => t.Translations)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<SurveyTemplate?> GetByIdWithQuestionsAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyTemplates.AsNoTracking()
            .Include(t => t.Translations)
            .Include(t => t.Questions.OrderBy(q => q.Order))
            .ThenInclude(q => q.Translations)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<SurveyTemplate>> GetByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyTemplates.AsNoTracking()
            .Include(t => t.Translations)
            .Include(t => t.Questions)
            .ThenInclude(q => q.Translations)
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
            .SurveyTemplates.AsNoTracking()
            .Include(t => t.Translations)
            .Include(t => t.Questions)
            .ThenInclude(q => q.Translations)
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
        // Query through translations table since Category is a computed property
        var matchingTemplateIds = await _context
            .SurveyTemplateTranslations.Where(t =>
                t.Template.NamespaceId == namespaceId && t.Category == category
            )
            .Select(t => t.TemplateId)
            .Distinct()
            .ToListAsync(cancellationToken);

        return await _context
            .SurveyTemplates.Include(t => t.Translations)
            .Include(t => t.Questions)
            .ThenInclude(q => q.Translations)
            .Where(t => matchingTemplateIds.Contains(t.Id))
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
            .SurveyTemplates.AsNoTracking()
            .Include(t => t.Translations)
            .Include(t => t.Questions)
            .ThenInclude(q => q.Translations)
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
            .SurveyTemplates.AsNoTracking()
            .Include(t => t.Translations)
            .Include(t => t.Questions)
            .ThenInclude(q => q.Translations)
            .Where(t => t.NamespaceId == namespaceId);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            // Query through translations table since Name/Description are computed properties
            var term = searchTerm.ToLower();
            var matchingTemplateIds = await _context
                .SurveyTemplateTranslations.Where(t =>
                    t.Name.ToLower().Contains(term)
                    || (t.Description != null && t.Description.ToLower().Contains(term))
                )
                .Select(t => t.TemplateId)
                .Distinct()
                .ToListAsync(cancellationToken);

            query = query.Where(t => matchingTemplateIds.Contains(t.Id));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            // Query through translations table since Category is a computed property
            var matchingCategoryIds = await _context
                .SurveyTemplateTranslations.Where(t => t.Category == category)
                .Select(t => t.TemplateId)
                .Distinct()
                .ToListAsync(cancellationToken);

            query = query.Where(t => matchingCategoryIds.Contains(t.Id));
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
        // Query through translations table since Category is a computed property
        return await _context
            .SurveyTemplateTranslations.Where(t =>
                t.Template.NamespaceId == namespaceId && t.Category != null
            )
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
        // Query through translations table since Name is a computed property
        var query = _context.SurveyTemplateTranslations.Where(t =>
            t.Template.NamespaceId == namespaceId && t.Name == name
        );

        if (excludeId.HasValue)
        {
            query = query.Where(t => t.TemplateId != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }
}
