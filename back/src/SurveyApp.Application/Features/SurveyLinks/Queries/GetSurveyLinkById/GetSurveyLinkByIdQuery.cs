using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.SurveyLinks.Queries.GetSurveyLinkById;

/// <summary>
/// Query to get a survey link by ID.
/// </summary>
/// <param name="SurveyId">The survey ID.</param>
/// <param name="LinkId">The link ID.</param>
public record GetSurveyLinkByIdQuery(Guid SurveyId, Guid LinkId)
    : IRequest<Result<SurveyLinkDetailsDto>>;
