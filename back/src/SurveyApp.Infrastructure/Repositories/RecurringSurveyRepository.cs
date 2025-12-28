using Microsoft.EntityFrameworkCore;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Infrastructure.Persistence;

namespace SurveyApp.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for RecurringSurvey entities.
/// </summary>
public class RecurringSurveyRepository(ApplicationDbContext context) : IRecurringSurveyRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<RecurringSurvey?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .RecurringSurveys.Include(r => r.Survey)
            .Include(r => r.Namespace)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<RecurringSurvey?> GetByIdWithRunsAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .RecurringSurveys.Include(r => r.Survey)
            .Include(r => r.Namespace)
            .Include(r => r.Runs.OrderByDescending(run => run.ScheduledAt))
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<RecurringSurvey>> GetByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .RecurringSurveys.Include(r => r.Survey)
            .Where(r => r.NamespaceId == namespaceId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<RecurringSurvey>> GetBySurveyIdAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .RecurringSurveys.Where(r => r.SurveyId == surveyId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<RecurringSurvey>> GetDueForExecutionAsync(
        DateTime asOfTime,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .RecurringSurveys.Include(r => r.Survey)
            .Where(r => r.IsActive && r.NextRunAt.HasValue && r.NextRunAt.Value <= asOfTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<RecurringSurvey> Items, int TotalCount)> GetPagedAsync(
        Guid namespaceId,
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = _context
            .RecurringSurveys.Include(r => r.Survey)
            .Where(r => r.NamespaceId == namespaceId);

        if (isActive.HasValue)
        {
            query = query.Where(r => r.IsActive == isActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(r =>
                r.Name.Contains(searchTerm) || r.Survey.Title.Contains(searchTerm)
            );
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<IReadOnlyList<RecurringSurvey>> GetUpcomingRunsAsync(
        Guid namespaceId,
        int count,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .RecurringSurveys.Include(r => r.Survey)
            .Where(r => r.NamespaceId == namespaceId && r.IsActive && r.NextRunAt.HasValue)
            .OrderBy(r => r.NextRunAt)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<RecurringSurveyRun> Items, int TotalCount)> GetRunsPagedAsync(
        Guid recurringSurveyId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default
    )
    {
        var query = _context.RecurringSurveyRuns.Where(r =>
            r.RecurringSurveyId == recurringSurveyId
        );

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(r => r.ScheduledAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<RecurringSurveyRun?> GetRunByIdAsync(
        Guid runId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context.RecurringSurveyRuns.FirstOrDefaultAsync(
            r => r.Id == runId,
            cancellationToken
        );
    }

    public async Task AddAsync(
        RecurringSurvey recurringSurvey,
        CancellationToken cancellationToken = default
    )
    {
        await _context.RecurringSurveys.AddAsync(recurringSurvey, cancellationToken);
    }

    public Task UpdateAsync(
        RecurringSurvey recurringSurvey,
        CancellationToken cancellationToken = default
    )
    {
        _context.RecurringSurveys.Update(recurringSurvey);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(
        RecurringSurvey recurringSurvey,
        CancellationToken cancellationToken = default
    )
    {
        _context.RecurringSurveys.Remove(recurringSurvey);
        return Task.CompletedTask;
    }

    public async Task AddRunAsync(
        RecurringSurveyRun run,
        CancellationToken cancellationToken = default
    )
    {
        await _context.RecurringSurveyRuns.AddAsync(run, cancellationToken);
    }

    public Task UpdateRunAsync(
        RecurringSurveyRun run,
        CancellationToken cancellationToken = default
    )
    {
        _context.RecurringSurveyRuns.Update(run);
        return Task.CompletedTask;
    }
}
