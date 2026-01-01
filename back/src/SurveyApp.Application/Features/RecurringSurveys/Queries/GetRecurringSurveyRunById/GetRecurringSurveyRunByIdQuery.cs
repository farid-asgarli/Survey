using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.RecurringSurveys.Queries.GetRecurringSurveyRunById;

/// <summary>
/// Query to get a specific recurring survey run by ID.
/// </summary>
/// <param name="RecurringSurveyId">The recurring survey ID.</param>
/// <param name="RunId">The run ID.</param>
public record GetRecurringSurveyRunByIdQuery(Guid RecurringSurveyId, Guid RunId)
    : IRequest<Result<RecurringSurveyRunDto>>;
