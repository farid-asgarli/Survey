using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.RecurringSurveys.Queries.GetRecurringSurveyById;

/// <summary>
/// Query to get a recurring survey by ID.
/// </summary>
public record GetRecurringSurveyByIdQuery : IRequest<Result<RecurringSurveyDto>>
{
    public Guid Id { get; init; }
}
