using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.EmailTemplates.Queries.GetEmailTemplateById;

/// <summary>
/// Query to get an email template by its ID.
/// </summary>
public record GetEmailTemplateByIdQuery(Guid Id) : IRequest<Result<EmailTemplateDto>>;
