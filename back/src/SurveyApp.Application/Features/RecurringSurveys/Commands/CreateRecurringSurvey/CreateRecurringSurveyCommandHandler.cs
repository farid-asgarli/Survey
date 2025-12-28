using AutoMapper;
using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.Common.Interfaces;
using SurveyApp.Application.DTOs;
using SurveyApp.Domain.Entities;
using SurveyApp.Domain.Interfaces;

namespace SurveyApp.Application.Features.RecurringSurveys.Commands.CreateRecurringSurvey;

/// <summary>
/// Handler for CreateRecurringSurveyCommand.
/// Namespace and permission validation is handled by NamespaceValidationBehavior pipeline.
/// </summary>
public class CreateRecurringSurveyCommandHandler(
    IRecurringSurveyRepository recurringSurveyRepository,
    ISurveyRepository surveyRepository,
    IUnitOfWork unitOfWork,
    INamespaceCommandContext commandContext,
    IMapper mapper
) : IRequestHandler<CreateRecurringSurveyCommand, Result<RecurringSurveyDto>>
{
    private readonly IRecurringSurveyRepository _recurringSurveyRepository =
        recurringSurveyRepository;
    private readonly ISurveyRepository _surveyRepository = surveyRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly INamespaceCommandContext _commandContext = commandContext;
    private readonly IMapper _mapper = mapper;

    public async Task<Result<RecurringSurveyDto>> Handle(
        CreateRecurringSurveyCommand request,
        CancellationToken cancellationToken
    )
    {
        // Context is validated by NamespaceValidationBehavior pipeline
        var ctx = _commandContext.Context!;

        // Verify survey exists and belongs to namespace
        var survey = await _surveyRepository.GetByIdAsync(request.SurveyId, cancellationToken);
        if (survey == null)
        {
            return Result<RecurringSurveyDto>.Failure("Survey not found.");
        }

        if (survey.NamespaceId != ctx.NamespaceId)
        {
            return Result<RecurringSurveyDto>.Failure("Survey does not belong to this namespace.");
        }

        // Create recurring survey
        var recurringSurvey = RecurringSurvey.Create(
            request.SurveyId,
            ctx.NamespaceId,
            request.Name,
            request.Pattern,
            request.SendTime,
            request.TimezoneId,
            request.AudienceType
        );

        // Update schedule
        recurringSurvey.UpdateSchedule(
            request.Pattern,
            request.SendTime,
            request.TimezoneId,
            request.DaysOfWeek,
            request.DayOfMonth,
            request.CronExpression
        );

        // Update audience
        recurringSurvey.UpdateAudience(
            request.AudienceType,
            request.RecipientEmails,
            request.AudienceListId
        );

        // Update reminder settings
        if (request.SendReminders)
        {
            recurringSurvey.UpdateReminderSettings(
                true,
                request.ReminderDaysAfter,
                request.MaxReminders
            );
        }

        // Update email content
        if (
            !string.IsNullOrWhiteSpace(request.CustomSubject)
            || !string.IsNullOrWhiteSpace(request.CustomMessage)
        )
        {
            recurringSurvey.UpdateEmailContent(request.CustomSubject, request.CustomMessage);
        }

        // Set end conditions
        if (request.EndsAt.HasValue || request.MaxRuns.HasValue)
        {
            recurringSurvey.SetEndConditions(request.EndsAt, request.MaxRuns);
        }

        // Activate if requested
        if (request.ActivateImmediately)
        {
            recurringSurvey.Activate();
        }

        await _recurringSurveyRepository.AddAsync(recurringSurvey, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<RecurringSurveyDto>(recurringSurvey);
        dto.SurveyTitle = survey.Title;
        dto.RecipientCount = request.RecipientEmails?.Length ?? 0;

        return Result<RecurringSurveyDto>.Success(dto);
    }
}
