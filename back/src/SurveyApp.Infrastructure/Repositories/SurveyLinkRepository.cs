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
            var startOfDay = startDate.Value.Date;
            query = query.Where(c => c.ClickedAt >= startOfDay);
        }

        if (endDate.HasValue)
        {
            // EndDate should be inclusive - include all clicks up to end of that day
            var endOfDay = endDate.Value.Date.AddDays(1);
            query = query.Where(c => c.ClickedAt < endOfDay);
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

    public async Task<int> GetClickCountAsync(
        Guid surveyLinkId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .LinkClicks.AsNoTracking()
            .CountAsync(c => c.SurveyLinkId == surveyLinkId, cancellationToken);
    }

    public async Task<Dictionary<Guid, int>> GetClickCountsAsync(
        IEnumerable<Guid> surveyLinkIds,
        CancellationToken cancellationToken = default
    )
    {
        var linkIdList = surveyLinkIds.ToList();
        if (linkIdList.Count == 0)
            return [];

        return await _context
            .LinkClicks.AsNoTracking()
            .Where(c => linkIdList.Contains(c.SurveyLinkId))
            .GroupBy(c => c.SurveyLinkId)
            .Select(g => new { SurveyLinkId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.SurveyLinkId, x => x.Count, cancellationToken);
    }

    public async Task<int> GetResponseCountAsync(
        Guid surveyLinkId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyResponses.AsNoTracking()
            .CountAsync(r => r.SurveyLinkId == surveyLinkId && r.IsComplete, cancellationToken);
    }

    public async Task<Dictionary<Guid, int>> GetResponseCountsAsync(
        IEnumerable<Guid> surveyLinkIds,
        CancellationToken cancellationToken = default
    )
    {
        var linkIdList = surveyLinkIds.ToList();
        if (linkIdList.Count == 0)
            return [];

        return await _context
            .SurveyResponses.AsNoTracking()
            .Where(r =>
                r.SurveyLinkId.HasValue && linkIdList.Contains(r.SurveyLinkId.Value) && r.IsComplete
            )
            .GroupBy(r => r.SurveyLinkId!.Value)
            .Select(g => new { SurveyLinkId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.SurveyLinkId, x => x.Count, cancellationToken);
    }
}
