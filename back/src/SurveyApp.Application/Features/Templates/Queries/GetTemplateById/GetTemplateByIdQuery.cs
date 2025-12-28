using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Templates.Queries.GetTemplateById;

public record GetTemplateByIdQuery : IRequest<Result<SurveyTemplateDto>>
{
    public Guid TemplateId { get; init; }
}
