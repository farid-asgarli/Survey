using Microsoft.EntityFrameworkCore;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Infrastructure.Persistence;

namespace SurveyApp.Infrastructure.Repositories;

public class EmailDistributionRepository(ApplicationDbContext context)
    : IEmailDistributionRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<EmailDistribution?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .EmailDistributions.AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
    }

    public async Task<EmailDistribution?> GetByIdForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        // No AsNoTracking() - enables change tracking for updates
        return await _context.EmailDistributions.FirstOrDefaultAsync(
            d => d.Id == id,
            cancellationToken
        );
    }

    public async Task<EmailDistribution?> GetByIdWithRecipientsAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .EmailDistributions.AsNoTracking()
            .Include(d => d.Recipients)
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<EmailDistribution>> GetBySurveyIdAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .EmailDistributions.AsNoTracking()
            .Where(d => d.SurveyId == surveyId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<(
        IReadOnlyList<EmailDistribution> Items,
        int TotalCount
    )> GetPagedBySurveyIdAsync(
        Guid surveyId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default
    )
    {
        var query = _context.EmailDistributions.AsNoTracking().Where(d => d.SurveyId == surveyId);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(d => d.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<IReadOnlyList<EmailDistribution>> GetByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .EmailDistributions.AsNoTracking()
            .Where(d => d.NamespaceId == namespaceId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<EmailDistribution>> GetScheduledDueAsync(
        DateTime asOfTime,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .EmailDistributions.Where(d =>
                d.Status == DistributionStatus.Scheduled && d.ScheduledAt <= asOfTime
            )
            .Include(d => d.Recipients)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<EmailDistribution>> GetByStatusAsync(
        Guid namespaceId,
        DistributionStatus status,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .EmailDistributions.AsNoTracking()
            .Where(d => d.NamespaceId == namespaceId && d.Status == status)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<EmailRecipient?> GetRecipientByTokenAsync(
        string token,
        CancellationToken cancellationToken = default
    )
    {
        return await _context.EmailRecipients.FirstOrDefaultAsync(
            r => r.UniqueToken == token,
            cancellationToken
        );
    }

    public async Task<IReadOnlyList<EmailRecipient>> GetRecipientsByDistributionIdAsync(
        Guid distributionId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .EmailRecipients.AsNoTracking()
            .Where(r => r.DistributionId == distributionId)
            .OrderBy(r => r.Email)
            .ToListAsync(cancellationToken);
    }

    public async Task<(
        IReadOnlyList<EmailRecipient> Items,
        int TotalCount
    )> GetRecipientsPagedAsync(
        Guid distributionId,
        int pageNumber,
        int pageSize,
        RecipientStatus? status = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = _context
            .EmailRecipients.AsNoTracking()
            .Where(r => r.DistributionId == distributionId);

        if (status.HasValue)
        {
            query = query.Where(r => r.Status == status.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(r => r.Email)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public void Add(EmailDistribution distribution)
    {
        _context.EmailDistributions.Add(distribution);
    }

    public void Update(EmailDistribution distribution)
    {
        _context.EmailDistributions.Update(distribution);
    }

    public void Delete(EmailDistribution distribution)
    {
        _context.EmailDistributions.Remove(distribution);
    }

    public void UpdateRecipient(EmailRecipient recipient)
    {
        _context.EmailRecipients.Update(recipient);
    }
}
