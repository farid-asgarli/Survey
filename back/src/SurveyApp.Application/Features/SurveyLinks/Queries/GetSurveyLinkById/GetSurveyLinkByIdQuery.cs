using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.SurveyLinks.Queries.GetSurveyLinkById;

/// <summary>
/// Query to get a survey link by ID.
/// </summary>
public record GetSurveyLinkByIdQuery : IRequest<Result<SurveyLinkDetailsDto>>
{
    public Guid SurveyId { get; init; }
    public Guid LinkId { get; init; }
}
