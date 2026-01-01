using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.RecurringSurveys.Queries.GetRecurringSurveyById;

/// <summary>
/// Query to get a recurring survey by ID.
/// </summary>
/// <param name="Id">The recurring survey ID.</param>
public record GetRecurringSurveyByIdQuery(Guid Id) : IRequest<Result<RecurringSurveyDto>>;
