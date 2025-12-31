using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;
using SurveyApp.Domain.ValueObjects;

namespace SurveyApp.Application.Features.Nps.Queries.GetQuestionNps;

/// <summary>
/// Handler for GetQuestionNpsQuery.
/// </summary>
public class GetQuestionNpsQueryHandler(
    ISurveyRepository surveyRepository,
    ISurveyResponseRepository responseRepository,
    INamespaceRepository namespaceRepository,
    INamespaceContext namespaceContext,
    ICurrentUserService currentUserService
) : IRequestHandler<GetQuestionNpsQuery, Result<NpsScoreDto>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly ISurveyResponseRepository _responseRepository = responseRepository;
    private readonly INamespaceRepository _namespaceRepository = namespaceRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly ICurrentUserService _currentUserService = currentUserService;

    public async Task<Result<NpsScoreDto>> Handle(
        GetQuestionNpsQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<NpsScoreDto>.Failure("Errors.NamespaceRequired");
        }

        // Verify survey exists and belongs to namespace
        var survey = await _surveyRepository.GetByIdWithQuestionsAsync(
            request.SurveyId,
            cancellationToken
        );
        if (survey == null || survey.NamespaceId != namespaceId.Value)
        {
            return Result<NpsScoreDto>.Failure("Errors.SurveyNotFound");
        }

        // Verify question exists in survey
        var question = survey.Questions.FirstOrDefault(q => q.Id == request.QuestionId);
        if (question == null)
        {
            return Result<NpsScoreDto>.Failure("Errors.QuestionNotInSurvey");
        }

        // Check permission
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
        {
            return Result<NpsScoreDto>.Failure("Errors.UserNotAuthenticated");
        }

        var @namespace = await _namespaceRepository.GetByIdAsync(
            namespaceId.Value,
            cancellationToken
        );
        var membership = @namespace?.Memberships.FirstOrDefault(m => m.UserId == userId.Value);
        if (membership == null || !membership.HasPermission(NamespacePermission.ViewResponses))
        {
            return Result<NpsScoreDto>.Failure("Errors.NoPermissionViewNps");
        }

        // Get analytics data and extract answers for this question
        var analyticsData = await _responseRepository.GetAnalyticsDataAsync(
            request.SurveyId,
            cancellationToken
        );
        var answers = analyticsData.AnswersByQuestion.GetValueOrDefault(request.QuestionId, []);

        // Parse answers and calculate NPS
        var numericAnswers = answers
            .Where(a => int.TryParse(a, out var value) && value >= 0 && value <= 10)
            .Select(a => int.Parse(a))
            .ToList();

        var npsScore = NpsScore.Calculate(numericAnswers);

        return Result<NpsScoreDto>.Success(
            new NpsScoreDto
            {
                Score = npsScore.Score,
                Promoters = npsScore.Promoters,
                Passives = npsScore.Passives,
                Detractors = npsScore.Detractors,
                TotalResponses = npsScore.TotalResponses,
                PromoterPercentage = npsScore.PromoterPercentage,
                PassivePercentage = npsScore.PassivePercentage,
                DetractorPercentage = npsScore.DetractorPercentage,
                Category = npsScore.Category.ToString(),
                CategoryDescription = npsScore.GetCategoryDescription(),
            }
        );
    }
}
