using Microsoft.EntityFrameworkCore;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Infrastructure.Persistence;

namespace SurveyApp.Infrastructure.Repositories;

public class EmailTemplateRepository(ApplicationDbContext context) : IEmailTemplateRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<EmailTemplate?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .EmailTemplates.AsNoTracking()
            .Include(t => t.Translations)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<EmailTemplate?> GetByIdForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        // No AsNoTracking() - enables change tracking for updates
        return await _context
            .EmailTemplates.Include(t => t.Translations)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<EmailTemplate>> GetByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .EmailTemplates.AsNoTracking()
            .Include(t => t.Translations)
            .Where(t => t.NamespaceId == namespaceId)
            .OrderByDescending(t => t.IsDefault)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<EmailTemplate?> GetDefaultByTypeAsync(
        Guid namespaceId,
        EmailTemplateType type,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .EmailTemplates.AsNoTracking()
            .Include(t => t.Translations)
            .FirstOrDefaultAsync(
                t => t.NamespaceId == namespaceId && t.Type == type && t.IsDefault,
                cancellationToken
            );
    }

    public async Task<IReadOnlyList<EmailTemplate>> GetByTypeAsync(
        Guid namespaceId,
        EmailTemplateType type,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .EmailTemplates.AsNoTracking()
            .Include(t => t.Translations)
            .Where(t => t.NamespaceId == namespaceId && t.Type == type)
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
        var query = _context.EmailTemplateTranslations.Where(t =>
            t.EmailTemplate.NamespaceId == namespaceId && t.Name == name
        );

        if (excludeId.HasValue)
        {
            query = query.Where(t => t.EmailTemplateId != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<EmailTemplate> Items, int TotalCount)> GetPagedAsync(
        Guid namespaceId,
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        EmailTemplateType? type = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = _context
            .EmailTemplates.AsNoTracking()
            .Include(t => t.Translations)
            .Where(t => t.NamespaceId == namespaceId);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            // Query through translations table since Name/Subject are computed properties
            var matchingTemplateIds = await _context
                .EmailTemplateTranslations.Where(t =>
                    t.Name.Contains(searchTerm) || t.Subject.Contains(searchTerm)
                )
                .Select(t => t.EmailTemplateId)
                .Distinct()
                .ToListAsync(cancellationToken);

            query = query.Where(t => matchingTemplateIds.Contains(t.Id));
        }

        if (type.HasValue)
        {
            query = query.Where(t => t.Type == type.Value);
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

    public void Add(EmailTemplate template)
    {
        _context.EmailTemplates.Add(template);
    }

    public void Update(EmailTemplate template)
    {
        _context.EmailTemplates.Update(template);
    }

    public void Delete(EmailTemplate template)
    {
        _context.EmailTemplates.Remove(template);
    }
}
