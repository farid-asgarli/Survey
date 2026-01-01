using Microsoft.EntityFrameworkCore;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Infrastructure.Persistence;

namespace SurveyApp.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for SurveyLink entities.
/// </summary>
public class SurveyLinkRepository(ApplicationDbContext context) : ISurveyLinkRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<SurveyLink?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyLinks.AsNoTracking()
            .Include(l => l.Survey)
            .ThenInclude(s => s.Translations)
            .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
    }

    public async Task<SurveyLink?> GetByIdForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        // No AsNoTracking() - enables change tracking for updates
        // No includes - we only need the link entity itself for counter updates
        return await _context.SurveyLinks.FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
    }

    public async Task<SurveyLink?> GetByIdWithClicksAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyLinks.AsNoTracking()
            .Include(l => l.Survey)
            .ThenInclude(s => s.Translations)
            .Include(l => l.Clicks)
            .ThenInclude(c => c.Response)
            .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
    }

    public async Task<SurveyLink?> GetByTokenAsync(
        string token,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyLinks.AsNoTracking()
            .Include(l => l.Survey)
            .ThenInclude(s => s.Translations)
            .FirstOrDefaultAsync(l => l.Token == token, cancellationToken);
    }

    public async Task<SurveyLink?> GetByTokenForUpdateAsync(
        string token,
        CancellationToken cancellationToken = default
    )
    {
        // No AsNoTracking() - enables change tracking for updates
        // No includes - we only need the link entity itself for counter updates
        return await _context.SurveyLinks.FirstOrDefaultAsync(
            l => l.Token == token,
            cancellationToken
        );
    }

    public async Task<IReadOnlyList<SurveyLink>> GetBySurveyIdAsync(
        Guid surveyId,
        bool? isActive = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = _context.SurveyLinks.AsNoTracking().Where(l => l.SurveyId == surveyId);

        if (isActive.HasValue)
        {
            query = query.Where(l => l.IsActive == isActive.Value);
        }

        return await query.OrderByDescending(l => l.CreatedAt).ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<SurveyLink> Items, int TotalCount)> GetBySurveyIdPagedAsync(
        Guid surveyId,
        int pageNumber,
        int pageSize,
        bool? isActive = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = _context.SurveyLinks.AsNoTracking().Where(l => l.SurveyId == surveyId);

        if (isActive.HasValue)
        {
            query = query.Where(l => l.IsActive == isActive.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task AddAsync(SurveyLink link, CancellationToken cancellationToken = default)
    {
        await _context.SurveyLinks.AddAsync(link, cancellationToken);
    }

    public async Task AddRangeAsync(
        IEnumerable<SurveyLink> links,
        CancellationToken cancellationToken = default
    )
    {
        await _context.SurveyLinks.AddRangeAsync(links, cancellationToken);
    }

    public void Update(SurveyLink link)
    {
        _context.SurveyLinks.Update(link);
    }

    public void Delete(SurveyLink link)
    {
        _context.SurveyLinks.Remove(link);
    }

    public async Task AddClickAsync(LinkClick click, CancellationToken cancellationToken = default)
    {
        await _context.LinkClicks.AddAsync(click, cancellationToken);
    }

    public async Task<IReadOnlyList<LinkClick>> GetClicksAsync(
        Guid surveyLinkId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = _context.LinkClicks.AsNoTracking().Where(c => c.SurveyLinkId == surveyLinkId);

        if (startDate.HasValue)
        {
            query = query.Where(c => c.ClickedAt >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(c => c.ClickedAt <= endDate.Value);
        }

        return await query.OrderByDescending(c => c.ClickedAt).ToListAsync(cancellationToken);
    }

    public async Task AssociateClickWithResponseAsync(
        Guid clickId,
        Guid responseId,
        CancellationToken cancellationToken = default
    )
    {
        var click = await _context.LinkClicks.FindAsync([clickId], cancellationToken);
        if (click != null)
        {
            click.AssociateResponse(responseId);
        }
    }
}
