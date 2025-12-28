using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Questions.Queries.GetQuestions;

/// <summary>
/// Handler for getting all questions in a survey.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class GetQuestionsQueryHandler(
    ISurveyRepository surveyRepository,
    INamespaceCommandContext commandContext,
    IMapper mapper
) : IRequestHandler<GetQuestionsQuery, Result<IReadOnlyList<QuestionDto>>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceCommandContext _commandContext = commandContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<IReadOnlyList<QuestionDto>>> Handle(
        GetQuestionsQuery request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        var survey = await _surveyRepository.GetByIdWithQuestionsAsync(
            request.SurveyId,
            cancellationToken
        );
        if (survey == null || survey.NamespaceId != ctx.NamespaceId)
        {
            return Result<IReadOnlyList<QuestionDto>>.Failure("Survey not found.");
        }

        var questions = survey.Questions.OrderBy(q => q.Order).ToList();

        var dtos = _mapper.Map<IReadOnlyList<QuestionDto>>(questions);
        return Result<IReadOnlyList<QuestionDto>>.Success(dtos);
    }
}
