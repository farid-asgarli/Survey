using Microsoft.EntityFrameworkCore;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Infrastructure.Persistence;

namespace SurveyApp.Infrastructure.Repositories;

public class QuestionLogicRepository(ApplicationDbContext context) : IQuestionLogicRepository
{
    private readonly ApplicationDbContext _context = context;

    public async Task<QuestionLogic?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context.QuestionLogics.AsNoTracking().FirstOrDefaultAsync(
            ql => ql.Id == id,
            cancellationToken
        );
    }

    public async Task<QuestionLogic?> GetByIdWithQuestionsAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .QuestionLogics.AsNoTracking()
            .Include(ql => ql.Question)
            .ThenInclude(q => q.Translations)
            .Include(ql => ql.SourceQuestion)
            .ThenInclude(q => q!.Translations)
            .Include(ql => ql.TargetQuestion)
            .ThenInclude(q => q!.Translations)
            .FirstOrDefaultAsync(ql => ql.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<QuestionLogic>> GetByQuestionIdAsync(
        Guid questionId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .QuestionLogics.AsNoTracking()
            .Include(ql => ql.SourceQuestion)
            .ThenInclude(q => q!.Translations)
            .Include(ql => ql.TargetQuestion)
            .ThenInclude(q => q!.Translations)
            .Where(ql => ql.QuestionId == questionId)
            .OrderBy(ql => ql.Priority)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<QuestionLogic>> GetBySurveyIdAsync(
        Guid surveyId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .QuestionLogics.AsNoTracking()
            .Include(ql => ql.Question)
            .ThenInclude(q => q.Translations)
            .Include(ql => ql.SourceQuestion)
            .ThenInclude(q => q!.Translations)
            .Include(ql => ql.TargetQuestion)
            .ThenInclude(q => q!.Translations)
            .Where(ql => ql.Question.SurveyId == surveyId)
            .OrderBy(ql => ql.Question.Order)
            .ThenBy(ql => ql.Priority)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<QuestionLogic>> GetBySourceQuestionIdAsync(
        Guid sourceQuestionId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .QuestionLogics.AsNoTracking()
            .Include(ql => ql.Question)
            .ThenInclude(q => q.Translations)
            .Include(ql => ql.TargetQuestion)
            .ThenInclude(q => q!.Translations)
            .Where(ql => ql.SourceQuestionId == sourceQuestionId)
            .OrderBy(ql => ql.Priority)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<QuestionLogic>> GetByTargetQuestionIdAsync(
        Guid targetQuestionId,
        CancellationToken cancellationToken = default
    )
    {
        return await _context
            .QuestionLogics.AsNoTracking()
            .Include(ql => ql.Question)
            .ThenInclude(q => q.Translations)
            .Include(ql => ql.SourceQuestion)
            .ThenInclude(q => q!.Translations)
            .Where(ql => ql.TargetQuestionId == targetQuestionId)
            .OrderBy(ql => ql.Priority)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.QuestionLogics.AnyAsync(ql => ql.Id == id, cancellationToken);
    }

    public async Task<int> GetMaxPriorityForQuestionAsync(
        Guid questionId,
        CancellationToken cancellationToken = default
    )
    {
        var maxPriority = await _context
            .QuestionLogics.Where(ql => ql.QuestionId == questionId)
            .MaxAsync(ql => (int?)ql.Priority, cancellationToken);

        return maxPriority ?? -1;
    }

    public void Add(QuestionLogic questionLogic)
    {
        _context.QuestionLogics.Add(questionLogic);
    }

    public void Update(QuestionLogic questionLogic)
    {
        _context.QuestionLogics.Update(questionLogic);
    }

    public void Remove(QuestionLogic questionLogic)
    {
        _context.QuestionLogics.Remove(questionLogic);
    }

    public async Task RemoveByQuestionIdAsync(
        Guid questionId,
        CancellationToken cancellationToken = default
    )
    {
        var logics = await _context
            .QuestionLogics.Where(ql => ql.QuestionId == questionId)
            .ToListAsync(cancellationToken);

        _context.QuestionLogics.RemoveRange(logics);
    }
}
