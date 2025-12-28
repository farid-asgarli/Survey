using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.Surveys.Queries.GetPublicSurvey;

public class GetPublicSurveyQueryHandler(ISurveyRepository surveyRepository, IMapper mapper)
    : IRequestHandler<GetPublicSurveyQuery, Result<PublicSurveyDto>>
{
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<PublicSurveyDto>> Handle(
        GetPublicSurveyQuery request,
        CancellationToken cancellationToken
    )
    {
        var survey = await _surveyRepository.GetByShareTokenAsync(
            request.ShareToken,
            cancellationToken
        );
        if (survey == null)
        {
            return Result<PublicSurveyDto>.Failure("Survey not found.");
        }

        // Check if survey is accepting responses
        if (!survey.IsAcceptingResponses)
        {
            return Result<PublicSurveyDto>.Failure(
                "This survey is not currently accepting responses."
            );
        }

        var dto = new PublicSurveyDto
        {
            Id = survey.Id,
            Title = survey.Title,
            Description = survey.Description,
            WelcomeMessage = survey.WelcomeMessage,
            ThankYouMessage = survey.ThankYouMessage,
            IsAnonymous = survey.IsAnonymous,
            Questions = survey
                .Questions.OrderBy(q => q.Order)
                .Select(q => new PublicQuestionDto
                {
                    Id = q.Id,
                    Text = q.Text,
                    Description = q.Description,
                    Type = q.Type,
                    IsRequired = q.IsRequired,
                    Order = q.Order,
                    Settings = _mapper.Map<DTOs.QuestionSettingsDto>(q.GetSettings())
                })
                .ToList()
        };

        return Result<PublicSurveyDto>.Success(dto);
    }
}
