using Microsoft.EntityFrameworkCore;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Enums;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Infrastructure.Persistence;

namespace SurveyApp.Infrastructure.Repositories;

public class SurveyRepository(ApplicationDbContext context) : ISurveyRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<Survey?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context
            .Surveys.AsNoTracking()
            .Include(s => s.Namespace)
            .Include(s => s.Translations)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<Survey?> GetByIdForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        // No AsNoTracking() - enables change tracking for updates
        return await _context
            .Surveys.Include(s => s.Namespace)
            .Include(s => s.Translations)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<Survey?> GetByIdWithQuestionsAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Surveys.AsNoTracking()
            .Include(s => s.Namespace)
            .Include(s => s.Translations)
            .Include(s => s.Questions.OrderBy(q => q.Order))
            .ThenInclude(q => q.Translations)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<Survey?> GetByIdWithQuestionsForUpdateAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        // No AsNoTracking() - enables change tracking for updates
        return await _context
            .Surveys.Include(s => s.Namespace)
            .Include(s => s.Translations)
            .Include(s => s.Questions.OrderBy(q => q.Order))
            .ThenInclude(q => q.Translations)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<Survey?> GetWithQuestionsAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Surveys.AsNoTracking()
            .Include(s => s.Namespace)
            .Include(s => s.Translations)
            .Include(s => s.Questions.OrderBy(q => q.Order))
            .ThenInclude(q => q.Translations)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<Survey?> GetByAccessTokenAsync(
        string accessToken,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Surveys.AsNoTracking()
            .Include(s => s.Translations)
            .Include(s => s.Questions.OrderBy(q => q.Order))
            .ThenInclude(q => q.Translations)
            .FirstOrDefaultAsync(s => s.AccessToken == accessToken, cancellationToken);
    }

    public async Task<Survey?> GetByShareTokenAsync(
        string shareToken,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Surveys.AsNoTracking()
            .Include(s => s.Translations)
            .Include(s => s.Questions.OrderBy(q => q.Order))
            .ThenInclude(q => q.Translations)
            .Include(s => s.Theme)
            .ThenInclude(t => t!.Translations)
            .FirstOrDefaultAsync(s => s.AccessToken == shareToken, cancellationToken);
    }

    public async Task<Survey?> GetByIdForPublicAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Surveys.AsNoTracking()
            .Include(s => s.Translations)
            .Include(s => s.Questions.OrderBy(q => q.Order))
            .ThenInclude(q => q.Translations)
            .Include(s => s.Theme)
            .ThenInclude(t => t!.Translations)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Survey>> GetByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Surveys.AsNoTracking()
            .Include(s => s.Translations)
            .Include(s => s.Questions)
            .ThenInclude(q => q.Translations)
            .Include(s => s.Responses)
            .Where(s => s.NamespaceId == namespaceId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Survey>> GetByStatusAsync(
        Guid namespaceId,
        SurveyStatus status,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Surveys.AsNoTracking()
            .Include(s => s.Translations)
            .Include(s => s.Questions)
            .ThenInclude(q => q.Translations)
            .Where(s => s.NamespaceId == namespaceId && s.Status == status)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Survey>> GetByCreatorAsync(
        Guid namespaceId,
        Guid creatorId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Surveys.AsNoTracking()
            .Include(s => s.Translations)
            .Include(s => s.Questions)
            .ThenInclude(q => q.Translations)
            .Where(s => s.NamespaceId == namespaceId && s.CreatedBy == creatorId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<Survey> Items, int TotalCount)> GetPagedAsync(
        Guid namespaceId,
        int pageNumber,
        int pageSize,
        string? searchTerm = null,
        SurveyStatus? status = null,
        string? sortBy = null,
        bool sortDescending = true,
        CancellationToken cancellationToken = default
    )
    {
        var query = _context
            .Surveys.AsNoTracking()
            .Include(s => s.Translations)
            .Include(s => s.Questions)
            .ThenInclude(q => q.Translations)
            .Include(s => s.Responses)
            .Where(s => s.NamespaceId == namespaceId);

        if (status.HasValue)
        {
            query = query.Where(s => s.Status == status.Value);
        }

        // Use efficient single-query search through translations using Any()
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var searchPattern = $"%{searchTerm}%";
            query = query.Where(s =>
                s.Translations.Any(t =>
                    EF.Functions.ILike(t.Title, searchPattern)
                    || (t.Description != null && EF.Functions.ILike(t.Description, searchPattern))
                )
            );
        }

        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        query = ApplySorting(query, sortBy, sortDescending);

        var surveys = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (surveys, totalCount);
    }

    private static IQueryable<Survey> ApplySorting(
        IQueryable<Survey> query,
        string? sortBy,
        bool sortDescending
    )
    {
        return sortBy?.ToLowerInvariant() switch
        {
            // Use OrderBy with subquery to avoid potential issues with First()
            "title" => sortDescending
                ? query.OrderByDescending(s =>
                    s.Translations.OrderBy(t => t.LanguageCode)
                        .Select(t => t.Title)
                        .FirstOrDefault()
                )
                : query.OrderBy(s =>
                    s.Translations.OrderBy(t => t.LanguageCode)
                        .Select(t => t.Title)
                        .FirstOrDefault()
                ),
            "updatedat" => sortDescending
                ? query.OrderByDescending(s => s.UpdatedAt ?? s.CreatedAt)
                : query.OrderBy(s => s.UpdatedAt ?? s.CreatedAt),
            "status" => sortDescending
                ? query.OrderByDescending(s => s.Status)
                : query.OrderBy(s => s.Status),
            "responsecount" => sortDescending
                ? query.OrderByDescending(s => s.Responses.Count)
                : query.OrderBy(s => s.Responses.Count),
            "questioncount" => sortDescending
                ? query.OrderByDescending(s => s.Questions.Count)
                : query.OrderBy(s => s.Questions.Count),
            _ => sortDescending
                ? query.OrderByDescending(s => s.CreatedAt)
                : query.OrderBy(s => s.CreatedAt), // Default: createdAt
        };
    }

    public async Task<Survey> AddAsync(Survey survey, CancellationToken cancellationToken = default)
    {
        await _context.Surveys.AddAsync(survey, cancellationToken);
        return survey;
    }

    public async Task AddQuestionAsync(
        Question question,
        CancellationToken cancellationToken = default
    )
    {
        await _context.Questions.AddAsync(question, cancellationToken);
    }

    public async Task AddTranslationAsync(
        SurveyTranslation translation,
        CancellationToken cancellationToken = default
    )
    {
        await _context.SurveyTranslations.AddAsync(translation, cancellationToken);
    }

    public async Task AddQuestionTranslationAsync(
        QuestionTranslation translation,
        CancellationToken cancellationToken = default
    )
    {
        await _context.QuestionTranslations.AddAsync(translation, cancellationToken);
    }

    public void Update(Survey survey)
    {
        _context.Surveys.Update(survey);
    }

    public void Delete(Survey survey)
    {
        _context.Surveys.Remove(survey);
    }
}
