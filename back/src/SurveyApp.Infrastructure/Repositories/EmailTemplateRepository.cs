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
        return await _context.EmailTemplates.FirstOrDefaultAsync(
            t => t.Id == id,
            cancellationToken
        );
    }

    public async Task<IReadOnlyList<EmailTemplate>> GetByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .EmailTemplates.Where(t => t.NamespaceId == namespaceId)
            .OrderByDescending(t => t.IsDefault)
            .ThenBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<EmailTemplate?> GetDefaultByTypeAsync(
        Guid namespaceId,
        EmailTemplateType type,
        CancellationToken cancellationToken = default
    )
    {
        return await _context.EmailTemplates.FirstOrDefaultAsync(
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
            .EmailTemplates.Where(t => t.NamespaceId == namespaceId && t.Type == type)
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
        var query = _context.EmailTemplates.Where(t =>
            t.NamespaceId == namespaceId && t.Name == name
        );

        if (excludeId.HasValue)
        {
            query = query.Where(t => t.Id != excludeId.Value);
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
        var query = _context.EmailTemplates.Where(t => t.NamespaceId == namespaceId);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(t => t.Name.Contains(searchTerm) || t.Subject.Contains(searchTerm));
        }

        if (type.HasValue)
        {
            query = query.Where(t => t.Type == type.Value);
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
