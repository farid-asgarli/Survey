using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Questions.Queries.GetQuestionById;

/// <summary>
/// Handler for getting a specific question by ID.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class GetQuestionByIdQueryHandler(
    ISurveyRepository surveyRepository,
    INamespaceCommandContext commandContext,
    IMapper mapper
) : IRequestHandler<GetQuestionByIdQuery, Result<QuestionDto>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceCommandContext _commandContext = commandContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<QuestionDto>> Handle(
        GetQuestionByIdQuery request,
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
            return Result<QuestionDto>.Failure("Survey not found.");
        }

        var question = survey.Questions.FirstOrDefault(q => q.Id == request.QuestionId);
        if (question == null)
        {
            return Result<QuestionDto>.Failure("Question not found.");
        }

        var dto = _mapper.Map<QuestionDto>(question);
        return Result<QuestionDto>.Success(dto);
    }
}
