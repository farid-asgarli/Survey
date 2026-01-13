using MediatR;
using SurveyApp.Application.Common;
using SurveyApp.Application.DTOs;

namespace SurveyApp.Application.Features.Categories.Queries.GetCategoryOptions;

/// <summary>
/// Query to get all category options (for dropdowns/select boxes).
/// </summary>
public record GetCategoryOptionsQuery : IRequest<Result<IReadOnlyList<CategoryOptionDto>>>;
