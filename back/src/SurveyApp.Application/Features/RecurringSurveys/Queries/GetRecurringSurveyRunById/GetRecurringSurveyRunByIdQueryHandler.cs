using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.RecurringSurveys.Queries.GetRecurringSurveyRunById;

/// <summary>
/// Handler for GetRecurringSurveyRunByIdQuery.
/// </summary>
public class GetRecurringSurveyRunByIdQueryHandler(
    IRecurringSurveyRepository recurringSurveyRepository,
    INamespaceContext namespaceContext,
    IMapper mapper
) : IRequestHandler<GetRecurringSurveyRunByIdQuery, Result<RecurringSurveyRunDto>>
{
    private readonly IRecurringSurveyRepository _recurringSurveyRepository =
        recurringSurveyRepository;
    private readonly INamespaceContext _namespaceContext = namespaceContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<RecurringSurveyRunDto>> Handle(
        GetRecurringSurveyRunByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        var namespaceId = _namespaceContext.CurrentNamespaceId;
        if (!namespaceId.HasValue)
        {
            return Result<RecurringSurveyRunDto>.Failure("Namespace context is required.");
        }

        // Verify the recurring survey exists and belongs to this namespace
        var recurringSurvey = await _recurringSurveyRepository.GetByIdAsync(
            request.RecurringSurveyId,
            cancellationToken
        );

        if (recurringSurvey == null)
        {
            return Result<RecurringSurveyRunDto>.Failure("Recurring survey not found.");
        }

        if (recurringSurvey.NamespaceId != namespaceId.Value)
        {
            return Result<RecurringSurveyRunDto>.Failure(
                "Recurring survey does not belong to this namespace."
            );
        }

        var run = await _recurringSurveyRepository.GetRunByIdAsync(
            request.RunId,
            cancellationToken
        );
        if (run == null)
        {
            return Result<RecurringSurveyRunDto>.Failure("Run not found.");
        }

        if (run.RecurringSurveyId != request.RecurringSurveyId)
        {
            return Result<RecurringSurveyRunDto>.Failure(
                "Run does not belong to this recurring survey."
            );
        }

        var dto = _mapper.Map<RecurringSurveyRunDto>(run);
        return Result<RecurringSurveyRunDto>.Success(dto);
    }
}
