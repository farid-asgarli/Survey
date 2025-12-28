using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.RecurringSurveys.Commands.UpdateRecurringSurvey;

/// <summary>
/// Handler for UpdateRecurringSurveyCommand.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class UpdateRecurringSurveyCommandHandler(
    IRecurringSurveyRepository recurringSurveyRepository,
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext,
    IMapper mapper
) : IRequestHandler<UpdateRecurringSurveyCommand, Result<RecurringSurveyDto>>
{
    private readonly IRecurringSurveyRepository _recurringSurveyRepository =
        recurringSurveyRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<RecurringSurveyDto>> Handle(
        UpdateRecurringSurveyCommand request,
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
            return Result<RecurringSurveyDto>.Failure("Recurring survey not found.");
        }

        if (recurringSurvey.NamespaceId != ctx.NamespaceId)
        {
            return Result<RecurringSurveyDto>.Failure(
                "Recurring survey does not belong to this namespace."
            );
        }

        // Update properties
        recurringSurvey.UpdateName(request.Name);

        recurringSurvey.UpdateSchedule(
            request.Pattern,
            request.SendTime,
            request.TimezoneId,
            request.DaysOfWeek,
            request.DayOfMonth,
            request.CronExpression
        );

        recurringSurvey.UpdateAudience(
            request.AudienceType,
            request.RecipientEmails,
            request.AudienceListId
        );

        recurringSurvey.UpdateReminderSettings(
            request.SendReminders,
            request.ReminderDaysAfter,
            request.MaxReminders
        );

        recurringSurvey.UpdateEmailContent(request.CustomSubject, request.CustomMessage);

        recurringSurvey.SetEndConditions(request.EndsAt, request.MaxRuns);

        await _recurringSurveyRepository.UpdateAsync(recurringSurvey, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Get survey title
        var survey = await _surveyRepository.GetByIdAsync(
            recurringSurvey.SurveyId,
            cancellationToken
        );

        var dto = _mapper.Map<RecurringSurveyDto>(recurringSurvey);
        dto.SurveyTitle = survey?.Title ?? "Unknown";
        dto.RecipientCount = request.RecipientEmails?.Length ?? 0;

        return Result<RecurringSurveyDto>.Success(dto);
    }
}
