using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.RecurringSurveys.Queries.GetRecurringSurveyRunById;

/// <summary>
/// Query to get a specific recurring survey run by ID.
/// </summary>
public record GetRecurringSurveyRunByIdQuery : IRequest<Result<RecurringSurveyRunDto>>
{
    public Guid RecurringSurveyId { get; init; }
    public Guid RunId { get; init; }
}
