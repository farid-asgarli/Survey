using Microsoft.EntityFrameworkCore;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Infrastructure.Persistence;

namespace SurveyApp.Infrastructure.Repositories;

public class SurveyResponseRepository(ApplicationDbContext context) : ISurveyResponseRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<SurveyResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyResponses.AsNoTracking()
            .Include(r => r.Respondent)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<SurveyResponse?> GetWithAnswersAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyResponses.AsNoTracking()
            .Include(r => r.Respondent)
            .Include(r => r.Answers)
            .ThenInclude(a => a.Question)
            .ThenInclude(q => q.Translations)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<SurveyResponse?> GetByIdWithAnswersAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyResponses.AsNoTracking()
            .Include(r => r.Respondent)
            .Include(r => r.Answers)
            .ThenInclude(a => a.Question)
            .ThenInclude(q => q.Translations)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<SurveyResponse>> GetBySurveyIdAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyResponses.AsNoTracking()
            .Include(r => r.Respondent)
            .Include(r => r.Answers)
            .Where(r => r.SurveyId == surveyId)
            .OrderByDescending(r => r.SubmittedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SurveyResponse>> GetCompletedBySurveyIdAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyResponses.AsNoTracking()
            .Include(r => r.Respondent)
            .Include(r => r.Answers)
            .Where(r => r.SurveyId == surveyId && r.IsComplete)
            .OrderByDescending(r => r.SubmittedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<(
        IReadOnlyList<SurveyResponse> Items,
        int TotalCount
    )> GetPagedBySurveyIdAsync(
        Guid surveyId,
        int pageNumber,
        int pageSize,
        bool completedOnly = false,
        CancellationToken cancellationToken = default
    )
    {
        var query = _context
            .SurveyResponses.AsNoTracking()
            .Include(r => r.Respondent)
            .Include(r => r.Answers)
            .Where(r => r.SurveyId == surveyId);

        if (completedOnly)
        {
            query = query.Where(r => r.IsComplete);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var responses = await query
            .OrderByDescending(r => r.SubmittedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (responses, totalCount);
    }

    public async Task<(IReadOnlyList<SurveyResponse> Items, int TotalCount)> GetPagedAsync(
        Guid surveyId,
        int pageNumber,
        int pageSize,
        bool? isCompleted = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = _context
            .SurveyResponses.AsNoTracking()
            .Include(r => r.Respondent)
            .Include(r => r.Answers)
            .Where(r => r.SurveyId == surveyId);

        if (isCompleted.HasValue)
        {
            query = query.Where(r => r.IsComplete == isCompleted.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var responses = await query
            .OrderByDescending(r => r.SubmittedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (responses, totalCount);
    }

    public async Task<int> GetResponseCountAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context.SurveyResponses.CountAsync(
            r => r.SurveyId == surveyId && r.IsComplete,
            cancellationToken
        );
    }

    public async Task<int> GetCountBySurveyIdAsync(
        Guid surveyId,
        bool completedOnly = false,
        CancellationToken cancellationToken = default
    )
    {
        var query = _context.SurveyResponses.Where(r => r.SurveyId == surveyId);

        if (completedOnly)
        {
            query = query.Where(r => r.IsComplete);
        }

        return await query.CountAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SurveyResponse>> GetByRespondentEmailAsync(
        Guid surveyId,
        string email,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .SurveyResponses.AsNoTracking()
            .Include(r => r.Respondent)
            .Include(r => r.Answers)
            .Where(r => r.SurveyId == surveyId && r.RespondentEmail == email)
            .OrderByDescending(r => r.SubmittedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> HasRespondedAsync(
        Guid surveyId,
        string email,
        CancellationToken cancellationToken = default
    )
    {
        return await _context.SurveyResponses.AnyAsync(
            r => r.SurveyId == surveyId && r.RespondentEmail == email && r.IsComplete,
            cancellationToken
        );
    }

    public async Task<IReadOnlyList<SurveyResponse>> GetFilteredForExportAsync(
        Guid surveyId,
        bool includeIncomplete = false,
        DateTime? startDate = null,
        DateTime? endDate = null,
        string? respondentEmail = null,
        bool? isComplete = null,
        CancellationToken cancellationToken = default
    )
    {
        var query = _context
            .SurveyResponses.AsNoTracking()
            .Include(r => r.Respondent)
            .Include(r => r.Answers)
            .Where(r => r.SurveyId == surveyId);

        // Apply completion filter
        if (!includeIncomplete)
        {
            query = query.Where(r => r.IsComplete);
        }
        else if (isComplete.HasValue)
        {
            query = query.Where(r => r.IsComplete == isComplete.Value);
        }

        // Apply date range filter
        if (startDate.HasValue)
        {
            query = query.Where(r => r.StartedAt >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(r => r.StartedAt <= endDate.Value);
        }

        // Apply email filter with case-insensitive search
        if (!string.IsNullOrEmpty(respondentEmail))
        {
            query = query.Where(r =>
                r.RespondentEmail != null
                && EF.Functions.ILike(r.RespondentEmail, $"%{respondentEmail}%")
            );
        }

        return await query.OrderByDescending(r => r.SubmittedAt).ToListAsync(cancellationToken);
    }

    public async Task<SurveyAnalyticsData> GetAnalyticsDataAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    )
    {
        var responses = await _context
            .SurveyResponses.AsNoTracking()
            .Include(r => r.Answers)
            .Where(r => r.SurveyId == surveyId)
            .ToListAsync(cancellationToken);

        var totalResponses = responses.Count;
        var completedResponses = responses.Count(r => r.IsComplete);
        var partialResponses = totalResponses - completedResponses;

        // Calculate average completion time
        var completedWithTime = responses
            .Where(r => r.IsComplete && r.SubmittedAt.HasValue)
            .Select(r => (r.SubmittedAt!.Value - r.StartedAt).TotalSeconds)
            .ToList();

        var averageTimeSpent = completedWithTime.Any() ? completedWithTime.Average() : 0;

        // First and last response dates
        var firstResponseAt = responses
            .Where(r => r.SubmittedAt.HasValue)
            .OrderBy(r => r.SubmittedAt)
            .Select(r => r.SubmittedAt)
            .FirstOrDefault();

        var lastResponseAt = responses
            .Where(r => r.SubmittedAt.HasValue)
            .OrderByDescending(r => r.SubmittedAt)
            .Select(r => r.SubmittedAt)
            .FirstOrDefault();

        // Responses by date (grouped by date, counting completed responses per day)
        var responsesByDate = responses
            .Where(r => r.SubmittedAt.HasValue)
            .GroupBy(r => r.SubmittedAt!.Value.Date)
            .ToDictionary(g => g.Key, g => g.Count());

        // Answers by question
        var answersByQuestion = responses
            .SelectMany(r => r.Answers)
            .GroupBy(a => a.QuestionId)
            .ToDictionary(g => g.Key, g => g.Select(a => a.AnswerValue ?? string.Empty).ToList());

        return new SurveyAnalyticsData
        {
            TotalResponses = totalResponses,
            CompletedResponses = completedResponses,
            PartialResponses = partialResponses,
            AverageTimeSpentSeconds = averageTimeSpent,
            FirstResponseAt = firstResponseAt,
            LastResponseAt = lastResponseAt,
            ResponsesByDate = responsesByDate,
            AnswersByQuestion = answersByQuestion,
        };
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.SurveyResponses.AnyAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<SurveyResponse> AddAsync(
        SurveyResponse response,
        CancellationToken cancellationToken = default
    )
    {
        await _context.SurveyResponses.AddAsync(response, cancellationToken);
        return response;
    }

    public void Update(SurveyResponse response)
    {
        _context.SurveyResponses.Update(response);
    }

    public void Delete(SurveyResponse response)
    {
        _context.SurveyResponses.Remove(response);
    }
}
