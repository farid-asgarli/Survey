using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.RecurringSurveys.Queries.GetRecurringSurveyById;

/// <summary>
/// Handler for GetRecurringSurveyByIdQuery.
/// </summary>
public class GetRecurringSurveyByIdQueryHandler(
    IRecurringSurveyRepository recurringSurveyRepository,
    ISurveyRepository surveyRepository,
    INamespaceContext namespaceContext,
    IMapper mapper
) : IRequestHandler<GetRecurringSurveyByIdQuery, Result<RecurringSurveyDto>>
{
    private readonly IRecurringSurveyRepository _recurringSurveyRepository =
        recurringSurveyRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<RecurringSurveyDto>> Handle(
        GetRecurringSurveyByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<RecurringSurveyDto>.Failure("Errors.NamespaceContextRequired");
        }

        var recurringSurvey = await _recurringSurveyRepository.GetByIdAsync(
            request.Id,
            cancellationToken
        );
        if (recurringSurvey == null)
        {
            return Result<RecurringSurveyDto>.NotFound("Errors.RecurringSurveyNotFound");
        }

        if (recurringSurvey.NamespaceId != namespaceId.Value)
        {
            return Result<RecurringSurveyDto>.Failure(
                "Errors.RecurringSurveyNotInNamespace"
            );
        }

        var survey = await _surveyRepository.GetByIdAsync(
            recurringSurvey.SurveyId,
            cancellationToken
        );

        var dto = _mapper.Map<RecurringSurveyDto>(recurringSurvey);
        dto.SurveyTitle = survey?.Title ?? "Unknown";
        dto.RecipientCount = recurringSurvey.RecipientEmails.Length;

        return Result<RecurringSurveyDto>.Success(dto);
    }
}
