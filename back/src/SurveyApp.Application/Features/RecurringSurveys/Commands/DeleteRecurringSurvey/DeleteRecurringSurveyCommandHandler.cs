using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.RecurringSurveys.Commands.DeleteRecurringSurvey;

/// <summary>
/// Handler for DeleteRecurringSurveyCommand.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class DeleteRecurringSurveyCommandHandler(
    IRecurringSurveyRepository recurringSurveyRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext
) : IRequestHandler<DeleteRecurringSurveyCommand, Result<bool>>
{
    private readonly IRecurringSurveyRepository _recurringSurveyRepository =
        recurringSurveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;

    public async Task<Result<bool>> Handle(
        DeleteRecurringSurveyCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        // Get recurring survey with change tracking for delete
        var recurringSurvey = await _recurringSurveyRepository.GetByIdForUpdateAsync(
            request.Id,
            cancellationToken
        );
        if (recurringSurvey == null)
        {
            return Result<bool>.Failure("Errors.RecurringSurveyNotFound");
        }

        if (recurringSurvey.NamespaceId != ctx.NamespaceId)
        {
            return Result<bool>.Failure("Errors.RecurringSurveyNotInNamespace");
        }

        await _recurringSurveyRepository.DeleteAsync(recurringSurvey, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
