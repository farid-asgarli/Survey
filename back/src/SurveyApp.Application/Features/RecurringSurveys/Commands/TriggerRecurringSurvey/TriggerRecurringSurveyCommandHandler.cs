using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.RecurringSurveys.Commands.TriggerRecurringSurvey;

/// <summary>
/// Handler for TriggerRecurringSurveyCommand.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class TriggerRecurringSurveyCommandHandler(
    IRecurringSurveyRepository recurringSurveyRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext,
    IMapper mapper
) : IRequestHandler<TriggerRecurringSurveyCommand, Result<RecurringSurveyRunDto>>
{
    private readonly IRecurringSurveyRepository _recurringSurveyRepository =
        recurringSurveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<RecurringSurveyRunDto>> Handle(
        TriggerRecurringSurveyCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        // Get recurring survey
        var recurringSurvey = await _recurringSurveyRepository.GetByIdAsync(
            request.Id,
            cancellationToken
        );
        if (recurringSurvey == null)
        {
            return Result<RecurringSurveyRunDto>.Failure("Errors.RecurringSurveyNotFound");
        }

        if (recurringSurvey.NamespaceId != ctx.NamespaceId)
        {
            return Result<RecurringSurveyRunDto>.Failure(
                "Recurring survey does not belong to this namespace."
            );
        }

        // Create a new run - in a real implementation, this would trigger the actual email sending
        // For now, we create a scheduled run that can be picked up by a background job
        var run = RecurringSurveyRun.CreateScheduled(
            recurringSurvey.Id,
            recurringSurvey.TotalRuns + 1,
            DateTime.UtcNow
        );

        await _recurringSurveyRepository.AddRunAsync(run, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<RecurringSurveyRunDto>(run);
        return Result<RecurringSurveyRunDto>.Success(dto);
    }
}
