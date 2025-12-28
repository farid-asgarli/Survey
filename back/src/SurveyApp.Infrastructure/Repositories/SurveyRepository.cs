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
            .Surveys.Include(s => s.Namespace)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<Survey?> GetByIdWithQuestionsAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Surveys.Include(s => s.Namespace)
            .Include(s => s.Questions.OrderBy(q => q.Order))
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<Survey?> GetWithQuestionsAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Surveys.Include(s => s.Namespace)
            .Include(s => s.Questions.OrderBy(q => q.Order))
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<Survey?> GetByAccessTokenAsync(
        string accessToken,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Surveys.Include(s => s.Questions.OrderBy(q => q.Order))
            .FirstOrDefaultAsync(s => s.AccessToken == accessToken, cancellationToken);
    }

    public async Task<Survey?> GetByShareTokenAsync(
        string shareToken,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Surveys.Include(s => s.Questions.OrderBy(q => q.Order))
            .Include(s => s.Theme)
            .FirstOrDefaultAsync(s => s.AccessToken == shareToken, cancellationToken);
    }

    public async Task<IReadOnlyList<Survey>> GetByNamespaceIdAsync(
        Guid namespaceId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .Surveys.Include(s => s.Questions)
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
            .Surveys.Include(s => s.Questions)
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
            .Surveys.Include(s => s.Questions)
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
        CancellationToken cancellationToken = default
    )
    {
        var query = _context
            .Surveys.Include(s => s.Questions)
            .Include(s => s.Responses)
            .Where(s => s.NamespaceId == namespaceId);

        if (status.HasValue)
        {
            query = query.Where(s => s.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(s =>
                s.Title.Contains(searchTerm)
                || (s.Description != null && s.Description.Contains(searchTerm))
            );
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var surveys = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (surveys, totalCount);
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

    public void Update(Survey survey)
    {
        _context.Surveys.Update(survey);
    }

    public void Delete(Survey survey)
    {
        _context.Surveys.Remove(survey);
    }
}
